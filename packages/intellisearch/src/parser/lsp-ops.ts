import * as vscode from "vscode";
import * as fs from "fs";

import { Symbol } from "./parser";

export class SymbolExt extends Symbol {
	readonly loc: vscode.Location;
	constructor(name: string, position: number[][], uri: vscode.Uri) {
		super(name, position);
		this.loc = new vscode.Location(uri, this.range);
	}
}

export class Telecom {
	private map: Map<string, Set<string>>;
	constructor() { this.map = new Map(); }

	static getIdentifier(item: vscode.CallHierarchyItem): string {
		const start = item.selectionRange.start;
		const end = item.selectionRange.end;
		return `${item.uri.fsPath}::${item.name}::${start.line}@${start.character}:${end.line}@${end.character}`;
	}

	static symbolize(s: string): SymbolExt | null {
		try {
			const [path, name, pos] = s.split("::");
			if (!fs.existsSync(path)) {
				throw new Error(`File not found: ${path}`);
			}
			const [start, end] = pos.split(":");
			const [startLine, startChar] = start.split("@");
			const [endLine, endChar] = end.split("@");
			return new SymbolExt(
				name, 
				[
					[parseInt(startLine), parseInt(startChar)], 
					[parseInt(endLine), parseInt(endChar)]
				],
				vscode.Uri.file(path)
			);
		} catch (e) {
			console.error(`Failed to symbolize ${s}: ${e}`);
			return null;
		}
	}

	static async getCallers(loc: vscode.Location): Promise<vscode.CallHierarchyItem[] | null> {
		const getCallHierarchy = async (loc: vscode.Location): Promise<vscode.CallHierarchyItem | vscode.CallHierarchyItem[] | undefined | null> => {
			return vscode.commands.executeCommand(
				"vscode.prepareCallHierarchy",
				loc.uri,
				loc.range.start
			);
		};
		const getIncomingCalls = async (item: vscode.CallHierarchyItem): Promise<vscode.CallHierarchyIncomingCall[] | undefined | null> => {
			return vscode.commands.executeCommand(
				"vscode.provideIncomingCalls",
				item
			);
		};
		let callHierarchy = await getCallHierarchy(loc);
		if (!callHierarchy) {
			return null;
		}
		if (!Array.isArray(callHierarchy)) {
			callHierarchy = [callHierarchy];
		}
		const callers: vscode.CallHierarchyItem[] = [];
		for (const item of callHierarchy) {
			const incomingCalls = await getIncomingCalls(item);
			if (!incomingCalls) {
				continue;
			}
			callers.push(...incomingCalls.map((c) => c.from));
		}
		if (callers.length === 0) {
			return null;
		}
		return callers;
	}

	addCaller(callee: vscode.CallHierarchyItem, caller: vscode.CallHierarchyItem) {
		const calleeId = Telecom.getIdentifier(callee);
		const callerId = Telecom.getIdentifier(caller);
		if (!this.map.has(calleeId)) {
			this.map.set(calleeId, new Set());
		}
		this.map.get(calleeId)?.add(callerId);
	}

	retrieveCallers(callee: vscode.CallHierarchyItem): SymbolExt[] {
		const calleeId = Telecom.getIdentifier(callee);
		if (!this.map.has(calleeId)) {
			return [];
		}
		const callers = Array.from(this.map.get(calleeId)!);
		return callers.map((c) => Telecom.symbolize(c)).filter(Boolean) as SymbolExt[];
	}
	
	async buildCallMap(callee: vscode.CallHierarchyItem, visited: Set<string> = new Set()): Promise<number> {
    const calleeId = Telecom.getIdentifier(callee);
    if (visited.has(calleeId)) {
			return Promise.resolve(0);
    }
    visited.add(calleeId);
    const loc = new vscode.Location(callee.uri, callee.selectionRange.start);
    return Telecom.getCallers(loc).then(callers => {
			if (!callers) {
				return 0;
			}
			const promises: Promise<number>[] = [];
			for (const caller of callers) {
				this.addCaller(callee, caller);
				promises.push(this.buildCallMap(caller, visited));
			}
			return Promise.all(promises).then((results) => {
				return results.reduce((acc, r) => acc + r, 0) + callers.length;
			});
    });
	}
}

export class DocumentLspOperator {
	docUri: vscode.Uri;
	docSymbols: vscode.DocumentSymbol[] = [];
	shortcut: Map<string, vscode.DocumentSymbol[]> = new Map();
	families: Map<vscode.DocumentSymbol, vscode.DocumentSymbol> = new Map();
	private sortFn = (a: vscode.DocumentSymbol, b: vscode.DocumentSymbol) => {
		return (
			a.range.start.compareTo(b.range.start) ||
			a.range.end.compareTo(b.range.end)
		);
	};
	
	constructor(docUri: vscode.Uri) {
		this.docUri = docUri;
	}

	private clear() {
		this.docSymbols = [];
		this.shortcut.clear();
		this.families.clear();
	}

	async init() {
		this.clear();
		const getDocumentSymbols = async (): Promise<vscode.DocumentSymbol[] | vscode.SymbolInformation[] | undefined | null> => 
		{
			return vscode.commands.executeCommand(
				"vscode.executeDocumentSymbolProvider",
				this.docUri
			);
		};
		let docSymbols = await getDocumentSymbols();
		if (docSymbols) {
			if (docSymbols[0] instanceof vscode.DocumentSymbol) {
				docSymbols = docSymbols as vscode.DocumentSymbol[];
				this.flatten(undefined, docSymbols);
			} else if (docSymbols[0] instanceof vscode.SymbolInformation) {
				docSymbols = this.symInfoToDocSym(docSymbols as vscode.SymbolInformation[]);
				this.flatten(undefined, docSymbols);
			}
		}
	}

	private flatten(parent: vscode.DocumentSymbol | undefined, docSymbols: vscode.DocumentSymbol[]) {
		docSymbols.sort(this.sortFn);
		for (const s of docSymbols) {
			this.docSymbols.push(s);
			if (parent) {
				this.families.set(s, parent);
			}
			const key = s.name;
			if (!this.shortcut.has(key)) {
				this.shortcut.set(key, []);
			}
			this.shortcut.get(key)?.push(s);
			if (s.children && s.children.length > 0) {
				this.flatten(s, s.children);
			}
		}
	}

	private symInfoToDocSym(
		symbols: (
			vscode.SymbolInformation & 
			{ range?: vscode.Range, selectionRange?: vscode.Range, children?: [] }
		)[]
	): vscode.DocumentSymbol[] {
		const map = new Map<string, vscode.DocumentSymbol>();
		const roots: vscode.DocumentSymbol[] = [];

		for (const symbol of symbols) {
			let { name, containerName, kind, location, range, selectionRange, children } = symbol;
			if (!range) {
				range = location.range;
			}
			const docSymbol = new vscode.DocumentSymbol(
				name,
				containerName || "",
				kind,
				range,
				selectionRange || range
			);
			if (children && children.length > 0) {
				docSymbol.children = this.symInfoToDocSym(children);
				roots.push(docSymbol);
			} else {
				if (containerName) {
					const parent = map.get(containerName);
					if (parent) {
						parent.children.push(docSymbol);
					} else {
						roots.push(docSymbol);
					}
				} else {
					roots.push(docSymbol);
				}
			}
			map.set(name, docSymbol);
		}
		return roots;
	}

	getRef(symbol: Symbol | vscode.DocumentSymbol): vscode.DocumentSymbol | null {
		const possibleRefs = this.shortcut.get(symbol.name);
		if (!possibleRefs) {
			return null;
		}
		possibleRefs.reverse();
		for (const ref of possibleRefs) {
			if (ref.range.contains(symbol.range)) {
				return ref;
			}
		}
		return null;
	}

	getWrapper(
		symbol: Symbol | vscode.DocumentSymbol,
		allowedWrapperKinds: vscode.SymbolKind[]
	): vscode.DocumentSymbol | null {
		let refSymbol: vscode.DocumentSymbol | null;
		if (symbol instanceof Symbol) {
			refSymbol = this.getRef(symbol);
		} else {
			refSymbol = symbol;
		}
		if (!refSymbol) {
			return null;
		}
		const findAllowedWrapper = (p: vscode.DocumentSymbol): vscode.DocumentSymbol | null => {
			if (allowedWrapperKinds.includes(p.kind) && p.range.contains(refSymbol.range)) {
				return p;
			}
			if (this.families.has(p)) {
				return findAllowedWrapper(this.families.get(p)!);
			}
			return null;
		};
		return findAllowedWrapper(refSymbol);
	}
}
