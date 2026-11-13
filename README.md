Структура проекта

brandbook/
├─ index.html        шапка, меню, сообщение об ошибке хранения, подвал
├─ common.css        общий стиль: токены, кнопки, поля, фокус, мобильная версия, печать
├─ state.js          общий state, палитры, шрифты, макеты, демо-данные
├─ storage.js        чтение, запись и удаление localStorage (ключ brandbook-draft)
├─ app.js            применяет тему и переключает разделы
├─ fonts/            сюда положите CocaCola-Regular.woff2
└─ sections/
   ├─ brief.js, brief.css   меняла Геля
   ├─ color.js              заготовка Лизы
   ├─ typography.js         заготовка Лизы
   └─ result.js             заготовка Ксюши

