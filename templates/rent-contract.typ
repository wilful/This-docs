// Договор аренды жилого помещения. Универсальная форма для сделок в РФ.
// Проверяйте необходимость государственной регистрации и специальных условий.
#set page(paper: "a4", margin: (x: 1.75cm, y: 1.25cm), numbering: "1")
#set text(font: "New Computer Modern", size: 9pt, lang: "ru", fill: rgb("000000"))
#set par(justify: true, leading: 0.36em, spacing: 0.16em)

#let val(v) = if v == "" or v == none { line(length: 10em, stroke: 0.45pt) } else { str(v) }
#let signature(p) = {
  let value = p.at("signature", default: "")
  if value == "" {
    line(length: 4cm, stroke: 0.5pt)
  } else {
    image(bytes(value), format: "svg", width: 4cm, height: 1cm, fit: "contain")
  }
}
#let section(title) = align(center)[#strong[#title]]

#let person(title, p) = block(
  breakable: false,
  inset: (x: 7pt, y: 6pt),
  stroke: (paint: rgb("b3b3b3"), thickness: 0.5pt),
)[
  #strong[#title]
  #linebreak()
  ФИО: #val(p.at("fio", default: "")) #linebreak()
  Дата рождения: #val(p.at("birthdate", default: "")) #linebreak()
  Паспорт: серия #val(p.at("passport_series", default: "")) номер #val(p.at("passport_number", default: "")) #linebreak()
  Кем выдан: #val(p.at("passport_issued", default: "")) #linebreak()
  Код подразделения: #val(p.at("passport_code", default: "")) #linebreak()
  Дата выдачи: #val(p.at("passport_date", default: "")) #linebreak()
  Адрес регистрации: #val(p.at("address", default: "")) #linebreak()
  Телефон: #val(p.at("phone", default: "")) #linebreak()
  Подпись: #signature(p)
]

#let doc(data: none) = {
  let landlords = data.landlords
  let tenants = data.tenants
  let housing = data.housing
  let terms = data.terms

  align(center)[ДОГОВОР АРЕНДЫ ЖИЛОГО ПОМЕЩЕНИЯ]
  if data.at("_specimen", default: false) {
    v(0.15em)
    align(center, text(size: 8pt, fill: rgb("888888"))[ОБРАЗЕЦ ЗАПОЛНЕНИЯ — сформирован для предварительного ознакомления. Не является подписанным документом.])
  }
  v(0.45em)
  grid(columns: (1fr, 1fr), gutter: 1em)[г. #val(terms.at("place", default: ""))][#align(right)[#val(terms.at("date", default: "")) г.]]
  v(0.5em)
  [Граждане, указанные в разделе 6 настоящего Договора, далее совместно именуемые "Стороны", заключили настоящий договор (далее — Договор) о нижеследующем:]

  v(0.35em)
  section("1. Предмет Договора")
  v(0.3em)
  [1.1. Арендодатель обязуется предоставить Арендатору за плату во владение и пользование жилое помещение (далее — Помещение) со следующими характеристиками:]
  v(0.25em)
  pad(left: 1.2cm)[
    #text("-") вид жилого помещения: #val(housing.at("housing_type", default: "")); #linebreak()
    #text("-") адрес: #val(housing.at("address", default: "")); #linebreak()
    #text("-") общая площадь, кв. м: #val(housing.at("area", default: "")); #linebreak()
    #text("-") жилая площадь, кв. м: #val(housing.at("living_area", default: "")); #linebreak()
    #text("-") количество комнат: #val(housing.at("rooms", default: "")); #linebreak()
    #text("-") этаж / этажность: #val(housing.at("floor", default: "")); #linebreak()
    #text("-") кадастровый номер: #val(housing.at("cadastral", default: "")); #linebreak()
  ]
  parbreak()
  v(0.12em)
  [1.2. Помещение принадлежит Арендодателю на праве собственности. Право подтверждается: #val(housing.at("ownership", default: "")).]
  parbreak()
  [1.3. Ограничения и обременения Помещения: #val(housing.at("encumbrances", default: "")).]
  parbreak()
  [1.4. Помещение пригодно для постоянного проживания, отвечает санитарным и техническим требованиям, предъявляемым к жилым помещениям, и передаётся Арендатору в состоянии, указанном в пункте 4.2 Договора.]

  v(0.25em)
  section("2. Срок аренды")
  v(0.2em)
  [2.1. Помещение предоставляется во владение и пользование Арендатору на срок с #val(terms.at("start_date", default: "")) по #val(terms.at("end_date", default: "")).]
  v(0.2em)
  [2.2. Если ни одна из Сторон не заявит о прекращении Договора не позднее чем за #val(terms.at("notice_days", default: "")) дней до окончания срока, Договор считается продлённым на тот же срок и на тех же условиях.]
  v(0.2em)
  [2.3. Каждая из Сторон вправе отказаться от Договора в любое время, письменно предупредив другую Сторону за #val(terms.at("notice_days", default: "")) дней, если иной срок не установлен законом.]

  v(0.25em)
  section("3. Арендная плата и порядок расчётов")
  v(0.2em)
  [3.1. Арендная плата составляет #val(terms.at("rent", default: "")) (#val(terms.at("rent_words", default: ""))) руб. в месяц.]
  v(0.2em)
  [3.2. Порядок и сроки внесения арендной платы: #val(terms.at("payment_terms", default: "")).]
  v(0.2em)
  [3.3. Обеспечительный платёж составляет #val(terms.at("deposit", default: "")) руб. Он возвращается Арендатору при прекращении Договора за вычетом задолженности по платежам и стоимости устранения ущерба, причинённого Помещению.]
  v(0.2em)
  [3.4. Плата за коммунальные и иные услуги: #val(terms.at("utilities", default: "")).]
  v(0.2em)
  [3.5. Размер арендной платы может быть изменён только по письменному соглашению Сторон, но не чаще одного раза в год. Оплата подтверждается распиской Арендодателя либо платёжным документом.]

  v(0.25em)
  section("4. Передача Помещения и порядок пользования")
  v(0.2em)
  [4.1. Помещение и ключи передаются Арендатору по акту приёма-передачи, в котором указываются показания приборов учёта и состояние Помещения.]
  v(0.2em)
  [4.2. Состояние Помещения и известные недостатки: #val(terms.at("condition", default: "")).]
  v(0.2em)
  [4.3. Вместе с Помещением передаются мебель, техника и иное имущество: #val(terms.at("property", default: "")).]
  v(0.2em)
  [4.4. Совместно с Арендатором в Помещении проживают: #val(terms.at("residents", default: "")).]
  v(0.2em)
  [4.5. Домашние животные: #val(terms.at("pets", default: "")).]
  v(0.2em)
  [4.6. Текущий ремонт и улучшения Помещения: #val(terms.at("repairs", default: "")).]
  v(0.2em)
  [4.7. Арендатор не вправе передавать Помещение в поднаём, вселять временных жильцов, использовать Помещение не по назначению, а также производить перепланировку и переоборудование без письменного согласия Арендодателя.]
  v(0.2em)
  [4.8. Арендатор обязан соблюдать правила пользования жилыми помещениями и порядок, установленный для проживающих в доме, обеспечивать сохранность Помещения и указанного имущества и за свой счёт устранять ущерб, причинённый по его вине.]
  v(0.2em)
  [4.9. По окончании срока аренды Арендатор возвращает Помещение по акту приёма-передачи в состоянии, в котором оно было получено, с учётом нормального износа.]

  v(0.25em)
  section("5. Заключительные положения")
  v(0.2em)
  [5.1. Договор вступает в силу с момента его подписания Сторонами и действует до полного исполнения Сторонами своих обязательств.]
  v(0.2em)
  [5.2. Договор составлен в количестве экземпляров, равном числу Сторон; все экземпляры имеют равную юридическую силу.]
  v(0.2em)
  [5.3. Все споры по Договору разрешаются в соответствии с законодательством Российской Федерации.]
  v(0.2em)
  [5.4. Дополнительные условия: #val(terms.at("additional", default: "")).]
  v(0.2em)
  [5.5. Приложения к Договору: #val(terms.at("appendices", default: "")).]

  v(0.3em)
  section("6. Адреса, реквизиты и подписи Сторон")
  v(0.2em)
  for (i, l) in landlords.enumerate() {
    person(if landlords.len() > 1 { "Арендодатель " + str(i + 1) } else { "Арендодатель" }, l)
    v(0.25em)
  }
  v(0.1em)
  for (i, t) in tenants.enumerate() {
    person(if tenants.len() > 1 { "Арендатор " + str(i + 1) } else { "Арендатор" }, t)
    v(0.25em)
  }
  v(0.15em)
  align(left, text(size: 8pt)[Перед подписанием проверьте сведения ЕГРН о правах и обременениях, полномочия сторон и необходимость государственной регистрации Договора.])
}
