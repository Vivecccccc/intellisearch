import axios from "axios";
import { ExtensionContext } from "vscode";

const projectId = "some-project-id";
const endpointUrl = "some-endpoint-url";
const modelId = "some-model-id";

enum TaskType {
  RETRIEVAL_DOCUMENT,
  RETRIEVAL_QUERY,
}

type Response = {
  predictions: {
    embeddings: {
      values: number[];
      statistics: {
        truncated: boolean;
        token_count: number
      }
    }
  }[],
  metadata: {
    billableCharacterCount: number;
  }
};

const buildPayloadBodyInstances = (texts: string[], taskType: TaskType) => {
  return texts.map((text) => {
    return { "task_type": TaskType[taskType], "content": text };
  });
};

const getEmbeddingValues = (response: Response) => {
  return response.predictions.map((pred) => pred.embeddings.values);
};

export async function getEmbeddings(texts: string[], taskType: TaskType, context: ExtensionContext) {
  const token = context.globalState.get("token");
  if (!token) {
    throw new Error("Authentication failed, please login");
  }
  const payload = {
    url: `${endpointUrl}/v1/projects/${projectId}/models/${modelId}:predict`,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: {
      instances: buildPayloadBodyInstances(texts, taskType),
    },
  };
  const embeddings = axios.post(payload.url, payload.body, { headers: payload.headers }).then((response) => {
    return getEmbeddingValues(response.data);
  }).catch((error) => {
    throw new Error(`Failed to get embeddings due to ${error}`);
  });
  return embeddings;
}
