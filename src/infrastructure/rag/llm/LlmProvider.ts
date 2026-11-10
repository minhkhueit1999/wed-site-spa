export interface LlmGenerateParams {
  system: string;
  context: string;
  question: string;
}

export interface LlmProvider {
  generate(params: LlmGenerateParams): Promise<string>;
}
