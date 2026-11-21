// Договор купли-продажи бывшего в эксплуатации транспортного средства.
// Структура адаптирована по предоставленному образцу; рекламные вставки исключены.
#set page(paper: "a4", margin: (x: 2.2cm, y: 1.8cm), numbering: "1")
#set text(font: "New Computer Modern", size: 10pt, lang: "ru", fill: rgb("282828"))
#set par(justify: true, leading: 0.55em, spacing: 0.35em)

#let val(v) = if v == "" or v == none { line(length: 6em, stroke: 0.5pt) } else { str(v) }
#let fld(label, v) = [#strong[#label:] #val(v)]
#let heading(title) = [#v(0.45em)#text(size: 10.5pt, weight: "bold")[#title]#v(0.15em)]
#let party(title, p) = block(inset: (x: 8pt, y: 6pt), stroke: (paint: rgb("d5c4a1"), thickness: 0.5pt))[
  #strong[#title]
  #parbreak()
  #fld("Ф.И.О.", p.at("fio", default: ""))
  #parbreak()
  #fld("Дата рождения", p.at("birthdate", default: ""))
  #parbreak()
  #fld("Паспорт: серия и номер", p.at("passport", default: ""))
  #parbreak()
  #fld("Кем выдан", p.at("passport_issued", default: ""))
  #parbreak()
  #fld("Код подразделения", p.at("passport_code", default: ""))
  #parbreak()
  #fld("Дата выдачи", p.at("passport_date", default: ""))
  #parbreak()
  #fld("Адрес регистрации", p.at("address", default: ""))
  #parbreak()
  #fld("Телефон", p.at("phone", default: ""))
]
#let signature() = line(length: 5em, stroke: 0.5pt)

#let doc(data: none) = {
  align(center)[
    #text(size: 16pt, weight: "bold")[ДОГОВОР КУПЛИ-ПРОДАЖИ]
    #linebreak()
    #text(size: 12pt, weight: "bold")[ТРАНСПОРТНОГО СРЕДСТВА]
  ]
  v(0.3em)
  grid(columns: (1fr, 1fr), gutter: 1em)[#fld("Место заключения", data.terms.at("place", default: ""))][#align(right)[#fld("Дата", data.terms.at("date", default: ""))]]
  [Граждане, указанные в разделе 4 настоящего Договора, далее именуемые «Продавец» и «Покупатель» соответственно, а совместно — «Стороны», заключили настоящий договор (далее — Договор) о нижеследующем:]

  heading("1. Предмет Договора. Общие положения")
  [1.1. Продавец обязуется передать в собственность Покупателя, а Покупатель обязуется принять и оплатить бывшее в эксплуатации транспортное средство (далее — транспортное средство) со следующими данными:]
  block(fill: rgb("f9f5e9"), inset: 8pt, radius: 3pt)[
    #fld("Государственный регистрационный знак", data.vehicle.at("plate", default: ""))
    #parbreak()
    #fld("Идентификационный номер (VIN)", data.vehicle.at("vin", default: ""))
    #parbreak()
    #fld("Марка, модель", data.vehicle.at("model", default: ""))
    #parbreak()
    #fld("Наименование (тип ТС)", data.vehicle.at("type", default: ""))
    #parbreak()
    #fld("Категория ТС", data.vehicle.at("category", default: ""))
    #parbreak()
    #fld("Год выпуска", data.vehicle.at("year", default: ""))
    #parbreak()
    #fld("Модель и номер двигателя", data.vehicle.at("engine", default: ""))
    #parbreak()
    #fld("Шасси (рама) №", data.vehicle.at("chassis", default: ""))
    #parbreak()
    #fld("Кузов (кабина, прицеп) №", data.vehicle.at("body", default: ""))
    #parbreak()
    #fld("Цвет", data.vehicle.at("color", default: ""))
    #parbreak()
    #fld("Мощность двигателя, кВт / л. с.", data.vehicle.at("power", default: ""))
    #parbreak()
    #fld("Рабочий объём двигателя, куб. см", data.vehicle.at("displacement", default: ""))
    #parbreak()
    #fld("Экологический класс", data.vehicle.at("eco_class", default: ""))
    #parbreak()
    #fld("Технически допустимая масса, кг", data.vehicle.at("max_mass", default: ""))
    #parbreak()
    #fld("Иные индивидуализирующие признаки", data.vehicle.at("individual_features", default: ""))
    #parbreak()
    #fld("Паспорт транспортного средства (ПТС / ЭПТС)", data.vehicle.at("pts", default: ""))
    #parbreak()
    #fld("Кем выдан ПТС", data.vehicle.at("pts_issued", default: ""))
  ]
  parbreak()
  [1.2. Принадлежность транспортного средства Продавцу на момент подписания Договора подтверждается указанным ПТС и свидетельством о регистрации транспортного средства (техническим паспортом):]
  parbreak()
  fld("СТС: серия и номер", data.vehicle.at("sts", default: ""))
  parbreak()
  fld("Кем и когда выдано", data.vehicle.at("sts_issued", default: ""))
  parbreak()
  [1.3. Покупатель заключает Договор, основываясь на достоверности, полноте и актуальности представленных Продавцом сведений о том, что Продавец является собственником транспортного средства; транспортное средство не находится в залоге, под арестом или запретом регистрационных действий, не числится в розыске и не обременено правами третьих лиц.]
  parbreak()
  [Сведения об имеющихся ограничениях, обременениях или правах третьих лиц (при отсутствии указать «отсутствуют»):]
  parbreak()
  fld("Сведения", data.vehicle.at("restrictions", default: ""))
  parbreak()
  [Если транспортное средство приобретено Продавцом в браке, Продавец подтверждает отсутствие возражений супруга (супруги) против отчуждения транспортного средства на условиях Договора.]
  parbreak()
  [При недостоверности указанных заверений Продавец обязуется возвратить Покупателю уплаченную за транспортное средство сумму в полном объёме со дня обнаружения нарушения.]

  heading("2. Цена, срок и порядок оплаты")
  [2.1. Цена транспортного средства составляет #val(data.terms.at("price", default: "")) (#val(data.terms.at("price_words", default: ""))) руб. НДС не облагается. Оплата производится наличным или безналичным расчётом в следующем порядке:]
  parbreak()
  fld("Порядок и срок оплаты", data.terms.at("payment", default: ""))
  parbreak()
  [2.2. Передача транспортного средства осуществляется Продавцом в момент передачи Покупателем денежных средств в счёт оплаты стоимости транспортного средства.]

  heading("3. Заключительные положения")
  [3.1. Настоящий Договор вступает в силу после его подписания Сторонами и действует до полного исполнения Сторонами обязательств.]
  parbreak()
  [3.2. Договор составлен в трёх экземплярах равной юридической силы: по одному для каждой из Сторон и один для регистрационных действий.]

  heading("4. Адреса и реквизиты Сторон")
  for s in data.sellers { party("Продавец", s); v(0.25em); [Денежные средства в сумме #val(data.terms.at("price", default: "")) руб. получил: #signature() / #strong[Ф.И.О.]; транспортное средство передал: #signature() / #strong[Ф.И.О.]]; v(0.35em) }
  for b in data.buyers { party("Покупатель", b); v(0.25em); [Транспортное средство получил: #signature() / #strong[Ф.И.О.]]; v(0.35em) }
}
