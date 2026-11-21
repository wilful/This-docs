// Шаблон договора купли-продажи недвижимости (базовый, РФ).
// Приложение вызывает #doc(data: (...)) — данные сгруппированы по разделам
// схемы. Повторяемые разделы (buyers/sellers) передаются массивами словарей.
// Пустое значение рендерится как линия для ручного заполнения.

#set page(margin: 2cm, paper: "a4")
#set text(font: "New Computer Modern", size: 11pt, lang: "ru")
#set par(justify: true, leading: 0.9em)

#let underline = line(length: 100%, stroke: 0.5pt)

#let blank(v) = {
  if v == "" or v == none { underline } else { [#v #h(0.3em) #underline] }
}

// Реквизиты одной стороны (номер по порядку + паспорт, адрес, телефон).
#let party(n, p) = {
  let tag = if n != none { str(n) + ". " } else { "" }
  let basis = p.at("basis", default: "")
  [#tag ФИО: #blank(p.at("fio", default: ""))]
  parbreak()
  [паспорт: #blank(p.at("passport", default: "")), адрес: #blank(p.at("address", default: "")), тел.: #blank(p.at("phone", default: ""))]
  parbreak()
  if basis != "" {
    [основание права: #blank(basis)]
    parbreak()
  }
}

// Строка подписи стороны.
#let sign(label, p) = {
  [#label: #blank(p.at("fio", default: ""))]
  parbreak()
}

#let doc(data: none) = {
  align(center, text(size: 15pt, weight: "bold")[Договор купли-продажи недвижимости])
  v(0.8em)

  [г. #blank(data.terms.at("place", default: ""))      #blank(data.terms.at("date", default: ""))]
  v(0.8em)

  [Мы, нижеподписавшиеся, заключили настоящий договор о нижеследующем.]

  v(0.6em)
  strong[1. Предмет договора]
  parbreak()
  [Продавец продаёт, а Покупатель покупает следующий объект недвижимости: #blank(data.object.at("object_type", default: "")), расположенный по адресу: #blank(data.object.at("address", default: "")), общей площадью #blank(data.object.at("area", default: "")) кв. м, кадастровый номер #blank(data.object.at("cadastral", default: "")).]
  v(0.6em)

  strong[2. Стороны договора]
  parbreak()
  [Покупатель:]
  parbreak()
  for (i, b) in data.buyers.enumerate() { party(i + 1, b) }
  v(0.3em)
  [Продавец:]
  parbreak()
  for (i, s) in data.sellers.enumerate() { party(i + 1, s) }
  v(0.6em)

  strong[3. Цена и порядок расчётов]
  parbreak()
  [3.1. Цена объекта составляет #blank(data.terms.at("price", default: "")) руб.]
  parbreak()
  if data.terms.at("payment", default: "") != "" {
    [3.2. Порядок расчётов: #blank(data.terms.at("payment", default: ""))]
    parbreak()
  }
  v(0.6em)

  strong[4. Заключительные положения]
  parbreak()
  [Настоящий договор составлен в двух экземплярах, по одному для каждой стороны. Право собственности переходит к Покупателю с момента государственной регистрации перехода права.]
  v(1.2em)

  strong[Подписи сторон]
  parbreak()
  for b in data.buyers { sign("Покупатель", b) }
  for s in data.sellers { sign("Продавец", s) }
}
