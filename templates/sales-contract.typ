// Шаблон договора купли-продажи.
// Приложение вызывает #doc(data: (...)) — данные сгруппированы по разделам
// схемы. Повторяемые разделы (buyers/sellers) передаются массивами словарей.
// Пустое значение рендерится как линия для ручного заполнения.

#set page(margin: 2cm, paper: "a4")
#set text(font: "New Computer Modern", size: 11pt)
#set par(justify: true, leading: 0.9em)

#let underline = line(length: 100%, stroke: 0.5pt)

#let blank(v) = {
  if v == "" or v == none { underline } else { [#v #h(0.3em) #underline] }
}

#let party(n, p) = {
  let tag = if n != none { [#(n). ] } else { [] }
  [#tag ФИО: #blank(p.at("fio", default: "")), тел.: #blank(p.at("phone", default: "")),]
  parbreak()
  [адрес: #blank(p.at("address", default: "")), паспорт: #blank(p.at("passport", default: ""))]
  parbreak()
}

#let doc(data) = {
  align(center, text(size: 16pt, weight: "bold")[Договор купли-продажи])
  v(0.4em)
  [г. #blank(data.terms.at("place", default: ""))        #blank(data.terms.at("date", default: ""))]
  v(1em)

  [Мы, нижеподписавшиеся, заключили настоящий договор:]
  v(0.4em)
  [Покупатель(и):]
  for (i, b) in data.buyers.enumerate() { party(i + 1, b) }
  v(0.4em)
  [Продавец(и):]
  for (i, s) in data.sellers.enumerate() { party(i + 1, s) }

  v(0.8em)
  [Объект: #blank(data.object.at("object_type", default: "")) по адресу
   #blank(data.object.at("address", default: "")),
   площадь #blank(data.object.at("area", default: "")) кв.м,
   кадастр № #blank(data.object.at("cadastral", default: "")).]
  v(0.4em)
  [Цена договора: #blank(data.terms.at("price", default: "")) руб.]
  v(1.4em)
  [Подписи:]
  v(0.3em)
  for b in data.buyers { [Покупатель: #blank(b.at("fio", default: ""))] parbreak() }
  for s in data.sellers { [Продавец: #blank(s.at("fio", default: ""))] parbreak() }
}
