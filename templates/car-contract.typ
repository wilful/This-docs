// Шаблон договора купли-продажи автомобиля (базовый, РФ).
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
  [#tag ФИО: #blank(p.at("fio", default: ""))]
  parbreak()
  [паспорт: #blank(p.at("passport", default: "")), адрес: #blank(p.at("address", default: "")), тел.: #blank(p.at("phone", default: ""))]
  parbreak()
}

// Строка «реквизит: значение» в разделе о транспортном средстве.
#let vrow(label, value) = {
  [#label: #blank(value)]
  parbreak()
}

// Строка подписи стороны.
#let sign(label, p) = {
  [#label: #blank(p.at("fio", default: ""))]
  parbreak()
}

#let doc(data: none) = {
  align(center, text(size: 15pt, weight: "bold")[Договор купли-продажи автомобиля])
  v(0.8em)

  [г. #blank(data.terms.at("place", default: ""))      #blank(data.terms.at("date", default: ""))]
  v(0.8em)

  [Мы, нижеподписавшиеся, заключили настоящий договор о нижеследующем.]

  v(0.6em)
  strong[1. Стороны договора]
  parbreak()
  [Продавец:]
  parbreak()
  for (i, s) in data.sellers.enumerate() { party(i + 1, s) }
  v(0.3em)
  [Покупатель:]
  parbreak()
  for (i, b) in data.buyers.enumerate() { party(i + 1, b) }
  v(0.6em)

  strong[2. Транспортное средство]
  parbreak()
  vrow("Марка, модель", data.vehicle.at("model", default: ""))
  vrow("Идентификационный номер (VIN)", data.vehicle.at("vin", default: ""))
  vrow("Год выпуска", data.vehicle.at("year", default: ""))
  vrow("Номер двигателя", data.vehicle.at("engine", default: ""))
  vrow("Номер кузова", data.vehicle.at("body", default: ""))
  vrow("Цвет", data.vehicle.at("color", default: ""))
  vrow("Государственный регистрационный знак", data.vehicle.at("plate", default: ""))
  vrow("Пробег, км", data.vehicle.at("mileage", default: ""))
  v(0.6em)

  strong[3. Цена и порядок расчётов]
  parbreak()
  [3.1. Стоимость автомобиля составляет #blank(data.terms.at("price", default: "")) руб.]
  parbreak()
  [3.2. Продавец передаёт автомобиль, а Покупатель принимает его и уплачивает стоимость в полном объёме.]
  v(0.6em)

  strong[4. Заключительные положения]
  parbreak()
  [Настоящий договор составлен в двух экземплярах, по одному для каждой стороны.]
  v(1.2em)

  strong[Подписи сторон]
  parbreak()
  for s in data.sellers { sign("Продавец", s) }
  for b in data.buyers { sign("Покупатель", b) }
}
