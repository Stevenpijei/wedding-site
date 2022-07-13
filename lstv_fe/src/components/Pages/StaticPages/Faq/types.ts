export type IQuestion = { q: string, a: string }
export type IFaq = {
  id: string,
  title: string,
  questions: IQuestion[]
}