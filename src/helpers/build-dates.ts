export function buildDate(date: string, time: string) {
  const [day, month, year] = date.split("/")
  const [hour, minute] = time.split(":")

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  )
}

//Pegar data local Brasil
export function getLocalDateString() {
    const now = new Date()

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
}

//Pegar data local Brasil recebendo parametro
export function dateToLocalString(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
}