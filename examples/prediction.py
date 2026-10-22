"""Standalone flat-rate forecast example; the website uses lib/prediction instead."""

import math


def calculate_food_rescue_prediction(
    merchant_name, current_inventory, closing_hour, current_hour, avg_hourly_sales
):
    """Estimate same-day leftovers from an assumed constant hourly sales rate."""
    if not isinstance(merchant_name, str) or not merchant_name.strip():
        raise ValueError("Merchant name is required.")
    if (
        isinstance(current_inventory, bool)
        or not isinstance(current_inventory, int)
        or current_inventory < 0
    ):
        raise ValueError("Inventory must be a nonnegative whole number.")

    for name, value in (
        ("Closing hour", closing_hour),
        ("Current hour", current_hour),
        ("Hourly sales", avg_hourly_sales),
    ):
        if (
            isinstance(value, bool)
            or not isinstance(value, (int, float))
            or not math.isfinite(value)
            or value < 0
        ):
            raise ValueError(f"{name} must be a finite nonnegative number.")
    if closing_hour > 24 or current_hour > 24:
        raise ValueError("Hours must be between 0 and 24 on the same day.")

    hours_remaining = max(0, closing_hour - current_hour)
    # Round expected units to the nearest whole item and cap sales at inventory.
    predicted_sales = min(
        current_inventory,
        math.floor(min(current_inventory, hours_remaining * avg_hourly_sales) + 0.5),
    )
    predicted_surplus = current_inventory - predicted_sales
    recommended_quantity = predicted_surplus if hours_remaining > 0 else 0
    discount_percentage = (
        50 if recommended_quantity >= current_inventory / 2 else 30
    ) if recommended_quantity > 0 else 0

    if hours_remaining == 0:
        action = "Merchant is closed; do not publish a new rescue offer."
    elif recommended_quantity == 0:
        action = "No surplus predicted; no rescue offer needed."
    else:
        action = f"Release {recommended_quantity} items for rescue before closing."

    return {
        "merchant": merchant_name.strip(),
        "current_stock": current_inventory,
        "predicted_normal_sales": predicted_sales,
        "predicted_surplus": predicted_surplus,
        "recommended_quantity": recommended_quantity,
        "recommended_discount": f"{discount_percentage}%",
        "action": action,
    }


if __name__ == "__main__":
    print(calculate_food_rescue_prediction("Bakery A", 18, 21, 19, 3.5))
