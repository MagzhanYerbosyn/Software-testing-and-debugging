# Automated Test Suite — Practice Software Testing

## Overview

This project contains an automated E2E test suite built with Playwright for the practice web application [practicesoftwaretesting.com](https://practicesoftwaretesting.com/). The aim of this test suite is to verify critical user flows including registration, authentication, product purchasing, product comparison, and password recovery.

---

## List of Test Cases to be Automated

| #     | Test Case                   | What it must prove                                                                                                                                     |
| ----- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1** | **Register a new customer** | A unique new account is created successfully, and the user ends up signed in or redirected to the login page.                                          |
| **2** | **Log in**                  | Valid credentials successfully grant access to the account page; invalid credentials display an appropriate error message and deny access.             |
| **3** | **Buy a product**           | Adding an available product to the cart reflects the correct item and quantity in the cart, and the complete checkout process finishes successfully.   |
| **4** | **Compare two products**    | Opening two products captures their respective names and prices, allowing a valid assertion of the comparison state/details.                           |
| **5** | **Reset a password**        | The forgot-password flow provides an expected confirmation message for a known email, and displays an error message for an invalid/unregistered email. |

---

## Prerequisites & Execution

- **Framework:** Playwright (TypeScript)
- **Configuration:** Test ID attribute set to `data-test`
- **Run Command:** `npx playwright test`
