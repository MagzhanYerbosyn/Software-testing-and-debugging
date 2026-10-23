# AI Tool Prompt & Usage Log

## AI Tool Specifications

- **Tool Used:** Gemini / Claude
- **Model Version:** Gemini 3.6 Flash / Claude 5.5 Sonnet Medium

---

## System Context & Project Stack

- **Framework:** Playwright (TypeScript)
- **Target Application:** https://practicesoftwaretesting.com/
- **Key Selector Strategy:** `data-test` attribute mapping via `testIdAttribute: 'data-test'`

---

## Original Prompt Used for Test Generation & Refactoring

```text

1. Register a new customer:
   - Проверка успешной регистрации с использованием уникального email (динамический генератор).
   - Заполнение всех обязательных полей формы и проверка перенаправления на страницу входа.

2. Log in:
   - Проверка входа с корректными учетными данными.
   - Проверка обработки ошибок при вводе неверного email/пароля.
   - Использование группы тестов (test.describe) и хука test.beforeEach для устранения дублирования кода.

3. Buy a product:
   - Поиск первого доступного товара в каталоге (пропуская статусы "Out of stock").
   - Добавление товара в корзину с динамическим количеством.
   - Проверка отображения наименования и количества товара (через toHaveValue для полей ввода) в корзине.
   - Прохождение полного процесса Checkout (вход в аккаунт через Promise.race/fallback, заполнение адреса, выбор оплаты и подтверждение заказа).

4. Compare two products:
   - Добавление двух разных товаров в список сравнения.
   - Переход на страницу сравнения, считывание названий и цен товаров и проверка их соответствия.

5. Reset a password:
   - Проверка успешной отправки запроса на восстановление пароля для существующего email.
   - Проверка отображения ошибки для незарегистрированного email.

Требования к коду:
- Использовать роли (getByRole) и тест-айди (getByTestId по атрибуту data-test).
- Избегать жестких задержек (waitForTimeout), использовать встроенные автоожидания Playwright (web-first assertions).
- Использовать синтаксис async/await без лишних await перед синхронными локаторами.
```
