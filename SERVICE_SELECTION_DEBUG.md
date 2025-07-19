# 🔧 Service Selection Debug Guide

## 🚨 **Issues Fixed**

I've identified and fixed several issues preventing service selection:

### **1. GraphQL Query Errors Fixed ✅**
- **Fixed**: `Variable 'barberId' of type 'ID' used in position expecting type 'ID!'`
- **Fixed**: `Unused variable 'shopId'` in working hours query
- **Fixed**: Missing `availabilityLoading` variable

### **2. Enhanced Service Loading ✅**
- **Added**: Dual service loading from both `barberShop.services` and `managementServicesByShop`
- **Added**: Debug logging to track service loading
- **Added**: Error handling for service addition

### **3. Debug Features Added ✅**
- **Console logs**: Track service loading and selection
- **Error alerts**: Show when services are added successfully
- **Fallback loading**: Multiple sources for service data

## 🔍 **Debug Steps**

### **Check the Console Logs:**
When you open the booking screen, you should see these logs:
```
Shop data: [object with barberShop data]
Services from barberShop: [number]
Services from managementServicesByShop: [number]
Using services: [array of services]
```

### **Service Addition Logs:**
When you tap the "+" button on a service:
```
Service add button pressed for: [service name]
Adding service to cart: [service object]
Updated cart: [cart object with new service]
```

### **Expected Behavior:**
1. **Services Load**: You should see service cards with pricing
2. **Add Button Works**: Tapping "+" shows "Service Added" alert
3. **Cart Updates**: Selected services appear in cart section
4. **Price Updates**: Total price updates in real-time

## 🛠️ **Troubleshooting Steps**

### **If No Services Show:**
1. **Check Backend**: Ensure your GraphQL server is running
2. **Check Data**: Look for console logs showing service count
3. **Check Network**: Verify API connection is working

### **If Services Show But Can't Add:**
1. **Check Console**: Look for "Service add button pressed" log
2. **Check Alerts**: Should see "Service Added" alert
3. **Check Cart**: Services should appear in cart section

### **If GraphQL Errors:**
1. **Check Backend Schema**: Ensure `managementServicesByShop` query exists
2. **Check Working Hours**: Verify `workingHours` query accepts ID! not ID
3. **Check Variables**: All required variables are provided

## 📱 **Test Instructions**

1. **Navigate to Booking Screen**
   - Go to a barber shop detail
   - Tap "Book Now" or select a barber

2. **Check Service Loading**
   - Should see "Select Services" section
   - Should see service cards with prices
   - Should see "+" buttons on each service

3. **Test Service Addition**
   - Tap the "+" button on any service
   - Should see "Service Added" alert
   - Should see service appear in cart section
   - Should see updated total price

4. **Check Console Logs**
   - Open developer tools
   - Look for debug messages
   - Check for any error messages

## 🎯 **What Should Work Now**

✅ **Service Loading**: Services load from backend  
✅ **Service Display**: Services show with prices and details  
✅ **Service Addition**: Can add services to cart  
✅ **Cart Management**: Services appear in cart with totals  
✅ **Error Handling**: Proper error messages and validation  
✅ **Debug Logging**: Comprehensive logging for troubleshooting  

## 📞 **If Still Not Working**

If services still don't load or can't be added:

1. **Check Backend**: Ensure GraphQL server is running and accessible
2. **Check Network**: Verify mobile app can reach backend
3. **Check Data**: Ensure barber shop has services in the database
4. **Check Logs**: Look for specific error messages in console

The service selection should now work correctly with comprehensive debugging and error handling!