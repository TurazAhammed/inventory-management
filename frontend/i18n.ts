import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      summary: {
        header: 'Summary',
        loading: 'Loading summaries...',
        today: 'Today',
        week: 'This Week',
        month: 'This Month',
        year: 'This Year',
        lifetime: 'Lifetime'
        ,
        addedQty: 'Added Qty',
        totalBuyingPrice: 'Total Buying Price',
        soldQty: 'Sold Qty',
        totalSoldPrice: 'Total Sold Price',
        profit: 'Profit'
      },
      common: {
        back: 'Back',
        home: 'Home',
        loading: 'Loading...',
        noItems: 'No items',
        edit: 'Edit',
        delete: 'Delete',
        cancel: 'Cancel',
        save: 'Save',
        confirm: 'Confirm'
      },
      addInventory: {
        back: 'Back',
        title: 'Add Inventory Item',
        itemName: 'Item Name',
        required: '*',
        itemNamePlaceholder: 'Enter item name',
        quantity: 'Quantity',
        quantityPlaceholder: 'Enter quantity',
        buyPrice: 'Buy Price',
        buyPricePlaceholder: 'Enter buy price',
        sellPrice: 'Sell Price',
        sellPricePlaceholder: 'Enter sell price',
        active: 'Active',
        addButton: 'Add Item',
        adding: 'Adding...',
        success: 'Success',
        itemAdded: 'Item added successfully',
        error: 'Error',
        failedToAdd: 'Failed to add item',
        nameQuantityRequired: 'Name and quantity are required'
      },
      addSales: {
        back: 'Back',
        title: 'Add Sale',
        itemId: 'Item',
        itemIdPlaceholder: 'Select an item',
        quantity: 'Quantity Sold',
        quantityPlaceholder: 'Enter quantity',
        salePrice: 'Sale Price',
        salePricePlaceholder: 'Enter sale price',
        // compatibility keys used in components
        pricePlaceholder: 'Enter sale price',
        itemQuantityPriceRequired: 'Item, quantity and price are required',
        exceedsStock: 'Quantity exceeds available stock',
        recorded: 'Sale recorded successfully',
        failedToRecord: 'Failed to record sale',
        addButton: 'Add Sale',
        adding: 'Adding...',
        success: 'Success',
        saleAdded: 'Sale added successfully',
        error: 'Error',
        failedToAdd: 'Failed to add sale',
        fieldsRequired: 'All fields are required'
      },
      inventory: {
        title: 'Inventory',
        noItems: 'No inventory items',
        id: 'ID',
        quantity: 'Quantity',
        unitBuyPrice: 'Buy Price',
        unitSellPrice: 'Sell Price',
        totalBuyPrice: 'Total Buy Price',
        active: 'Active',
        yes: 'Yes',
        no: 'No',
        added: 'Added',
        loading: 'Loading...',
        editItem: 'Edit Item',
        confirmDelete: 'Are you sure you want to delete this item?',
        updateFailed: 'Failed to update item',
        deleteFailed: 'Failed to delete item'
      },
      sales: {
        title: 'Sales',
        noItems: 'No sales available',
        totalSale: 'Total Sale',
        itemId: 'Item ID',
        soldAt: 'Sold At'
      }
    }
  },
  bn: {
    translation: {
      summary: {
        header: 'সারসংক্ষেপ',
        loading: 'সামারি লোড হচ্ছে...',
        today: 'আজ',
        week: 'এই সপ্তাহ',
        month: 'এই মাস',
        year: 'এই বছর',
        lifetime: 'সময়ের মোট'
        ,
        addedQty: 'যোগ করা পরিমাণ',
        totalBuyingPrice: 'মোট ক্রয় মূল্য',
        soldQty: 'বিক্রি পরিমাণ',
        totalSoldPrice: 'মোট বিক্রয় মূল্য',
        profit: 'লাভ/ক্ষতি'
      },
      common: {
        back: 'ফিরে যান',
        home: 'বাড়ি',
        loading: 'লোড হচ্ছে...',
        noItems: 'কোনো আইটেম নেই',
        edit: 'সম্পাদনা',
        delete: 'মুছুন',
        cancel: 'বাতিল',
        save: 'সংরক্ষণ',
        confirm: 'নিশ্চিত'
      },
      addInventory: {
        back: 'ফিরে যান',
        title: 'নতুন ইনভেন্টরি যোগ করুন',
        itemName: 'পণ্যের নাম',
        required: '*',
        itemNamePlaceholder: 'পণ্যের নাম লিখুন',
        quantity: 'পরিমাণ',
        quantityPlaceholder: 'পরিমাণ লিখুন',
        buyPrice: 'ক্রয় মূল্য',
        buyPricePlaceholder: 'ক্রয় মূল্য লিখুন',
        sellPrice: 'বিক্রয় মূল্য',
        sellPricePlaceholder: 'বিক্রয় মূল্য লিখুন',
        active: 'সক্রিয়',
        addButton: 'যোগ করুন',
        adding: 'যোগ করা হচ্ছে...',
        success: 'সফল',
        itemAdded: 'আইটেম সফলভাবে যোগ হয়েছে',
        error: 'ত্রুটি',
        failedToAdd: 'আইটেম যোগ করা যায়নি',
        nameQuantityRequired: 'নাম এবং পরিমাণ প্রয়োজন'
      },
      addSales: {
        back: 'ফিরে যান',
        title: 'বিক্রয় যোগ করুন',
        itemId: 'পণ্য',
        itemIdPlaceholder: 'পণ্য নির্বাচন করুন',
        quantity: 'বিক্রি পরিমাণ',
        quantityPlaceholder: 'পরিমাণ লিখুন',
        salePrice: 'বিক্রয় মূল্য',
        salePricePlaceholder: 'বিক্রয় মূল্য লিখুন',
        // compatibility keys used in components
        pricePlaceholder: 'বিক্রয় মূল্য লিখুন',
        itemQuantityPriceRequired: 'পণ্য, পরিমাণ এবং মূল্য প্রয়োজন',
        exceedsStock: 'প্রাপ্য স্টক অতিরিক্ত পরিমাণ',
        recorded: 'বিক্রয় সফলভাবে যোগ হয়েছে',
        failedToRecord: 'বিক্রয় যোগ করা যায়নি',
        addButton: 'বিক্রয় যোগ করুন',
        adding: 'যোগ করা হচ্ছে...',
        success: 'সফল',
        saleAdded: 'বিক্রয় সফলভাবে যোগ হয়েছে',
        error: 'ত্রুটি',
        failedToAdd: 'বিক্রয় যোগ করা যায়নি',
        fieldsRequired: 'সকল ক্ষেত্র পূরণ করুন'
      },
      inventory: {
        title: 'ইনভেন্টরি',
        noItems: 'কোনো ইনভেন্টরি নেই',
        id: 'আইডি',
        quantity: 'পরিমাণ',
        unitBuyPrice: 'ক্রয় মূল্য',
        unitSellPrice: 'বিক্রয় মূল্য',
        totalBuyPrice: 'মোট ক্রয় মূল্য',
        active: 'সক্রিয়',
        yes: 'হ্যাঁ',
        no: 'না',
        added: 'যোগ করা হয়েছে',
        loading: 'লোড হচ্ছে...',
        editItem: 'আইটেম সম্পাদনা',
        confirmDelete: 'আপনি কি নিশ্চিত যে এই আইটেমটি মুছতে চান?',
        updateFailed: 'আইটেম আপডেট করা যায়নি',
        deleteFailed: 'আইটেম মুছা যায়নি'
      },
      sales: {
        title: 'বিক্রয়',
        noItems: 'কোনো বিক্রয় নেই',
        totalSale: 'মোট বিক্রয়',
        itemId: 'আইটেম আইডি',
        soldAt: 'বিক্রি হয়েছে'
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
} as any);

export default i18n;
