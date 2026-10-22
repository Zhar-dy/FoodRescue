def calculate_food_rescue_prediction(merchant_name, current_inventory, closing_hour, current_hour, avg_hourly_sales):
    """
    FoodRescue AI - Prediction Engine Logic
    Example: Bakery A
    """
    hours_remaining = closing_hour - current_hour
    
    # Predict normal sales until closing
    predicted_sales = hours_remaining * avg_hourly_sales
    
    # Calculate predicted surplus (ensuring it doesn't drop below 0)
    predicted_surplus = max(0, current_inventory - int(predicted_sales))
    
    # Recommended discount action
    discount_percentage = 50 if predicted_surplus > 5 else 30
    
    return {
        "merchant": merchant_name,
        "current_stock": current_inventory,
        "predicted_normal_sales": int(predicted_sales),
        "predicted_surplus": predicted_surplus,
        "recommended_discount": f"{discount_percentage}%",
        "action": f"Release {predicted_surplus} items for rescue offer at 8:00 PM"
    }

# Test with Bakery A example: 18 buns left, closing at 9 PM, current time 7 PM, selling ~3.5 buns/hr
result = calculate_food_rescue_prediction("Bakery A", current_inventory=18, closing_hour=21, current_hour=19, avg_hourly_sales=3.5)
print(result)
