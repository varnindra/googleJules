import re
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    This script verifies the end-to-end user flow of the Family Finance App.
    It registers a user, seeds the database, creates a transaction, and verifies the result.
    """
    # 1. Navigate to the app
    page.goto("http://localhost:3000")

    # 2. Register a new user
    print("Registering a new user...")
    page.get_by_placeholder("Name").fill("Jules Verne")
    page.get_by_placeholder("Email").fill("jules.verne@example.com")
    page.get_by_placeholder("Password").fill("password123")
    page.get_by_role("button", name="Register").click()

    # Assert that the registration was successful
    expect(page.get_by_text("User Jules Verne created!")).to_be_visible()
    print("Registration successful.")

    # 3. Seed the database
    print("Seeding the database...")
    page.get_by_role("button", name="Seed 'General' Category").click()

    # Assert that seeding was successful
    expect(page.get_by_text("Database seeded with 'General' category.")).to_be_visible()
    print("Seeding successful.")

    # 4. Create a new transaction
    print("Creating a new transaction...")
    page.get_by_placeholder("Amount").fill("123.45")
    page.get_by_placeholder("Description").fill("Test Expense")
    page.get_by_role("button", name="Create Expense").click()

    # Assert that the transaction was created
    expect(page.get_by_text("Transaction created successfully!")).to_be_visible()
    print("Transaction creation successful.")

    # 5. Verify the transaction appears in the list
    print("Verifying transaction in the list...")
    transaction_list = page.get_by_role("list")

    # Check for the description and amount
    expect(transaction_list.get_by_text("Test Expense")).to_be_visible()
    expect(transaction_list.get_by_text("$123.45")).to_be_visible()

    # Check for the user and category
    expect(transaction_list.get_by_text(re.compile(r"by Jules Verne"))).to_be_visible()
    expect(transaction_list.get_by_text(re.compile(r"Category: General"))).to_be_visible()

    print("Transaction verified in the list.")

    # 6. Take a screenshot for final verification
    screenshot_path = "jules-scratch/verification/verification.png"
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_verification(page)
        except Exception as e:
            print(f"An error occurred during verification: {e}")
            # Take a screenshot on error for debugging
            page.screenshot(path="jules-scratch/verification/error.png")
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    main()
