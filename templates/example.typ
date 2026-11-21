// Пример шаблона: простое заявление.
// Файл определяет функцию doc(..) с именованными параметрами.
// Пустой параметр рендерится как линия для ручного заполнения.
// Приложение добавляет вызов #doc(...) в конце этого файла.

#set page(margin: 2cm, paper: "a4")
#set text(font: "New Computer Modern", size: 11pt)
#set par(justify: false, leading: 0.9em)

#let underline = line(length: 100%, stroke: 0.5pt)

#let field(label, value) = {
  [#label:#h(0.5em)]
  if value == "" or value == none {
    underline
  } else {
    [#value #h(0.3em) #underline]
  }
  parbreak()
}

#let doc(
  fio: "",
  date: "",
  address: "",
  phone: "",
  comment: "",
) = {
  align(center, text(size: 16pt, weight: "bold")[Заявление])
  v(1em)

  field("ФИО", fio)
  field("Дата", date)
  field("Адрес", address)
  field("Телефон", phone)
  field("Примечание", comment)

  v(1.5em)
  grid(
    columns: (auto, 1fr),
    column-gutter: 0.5em,
    [Подпись:], underline,
  )
}
