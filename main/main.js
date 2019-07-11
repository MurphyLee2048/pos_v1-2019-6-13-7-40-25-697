'use strict';
const loadAllItems = require('../__tests__/fixtures').loadAllItems;
const loadPromotions = require('../__tests__/fixtures').loadPromotions;

function isValid(tags) {
    for (let i = 0; i < tags.length; i++) {
        if (isSingleValid(tags[i].substr(0, 10)) === false) {

            return false;
        }
    }
    return true;
}

const isSingleValid = (barcode) => {
    const allItems = loadAllItems();  // TODO: allItems可以全局化
    for (let i = 0; i < allItems.length; i++) {
        if (barcode === allItems[i].barcode) {
            return true;
        }
    }
    return false;
};

const splitTag = (tags) => {
    let spiltedTags = [];
    for (let i = 0; i < tags.length; i++) {
        if (tags[i].indexOf('-') === -1) {
            spiltedTags.push({"barcode":tags[i], "count":1});
        }
        else {
            spiltedTags.push({"barcode":tags[i].substr(0, 10), "count": Number(tags[i].substr(11))});
        }
    }
    return spiltedTags;
};

const dereplication = (splitedTags) => {
    let dereplicatedTags = [];
    let map = new Map();
    for (let i = 0; i < splitedTags.length; i++) {
        if (map.has(splitedTags[i].barcode)) {
            map.set(splitedTags[i].barcode, splitedTags[i].count + map.get(splitedTags[i].barcode));
        }else {
            map.set(splitedTags[i].barcode, splitedTags[i].count);
        }
    }
    for (var [key, value] of map.entries()) {
        dereplicatedTags.push({"barcode": key, "count": value})
    }
    return dereplicatedTags;

};

const getInfo = (barcode) => {
    const allItems = loadAllItems();  // TODO: allItems可以全局化
    for (let i = 0; i < allItems.length; i++) {
        if (barcode === allItems[i].barcode) {
            return allItems[i];
        }
    }
};

const isDiscount = (barcode) => {
    let promotions = loadPromotions()[0].barcodes;  // TODO:全局化？
    for (let i = 0; i < promotions.length; i++) {
        if (barcode === promotions[i]) {
            return true;
        }
    }
    return false;
};

const getPrice = (dereplicatedTags) => {
    let receiptItems = [];
    for ( let i = 0; i < dereplicatedTags.length; i++) {
        let metaItem = getInfo(dereplicatedTags[i].barcode);
        let subTotal = 0;
        if (isDiscount(dereplicatedTags[i].barcode)) {
            subTotal = metaItem.price * dereplicatedTags[i].count - Math.floor(dereplicatedTags[i].count / 3) * metaItem.price;
        } else {
            subTotal = metaItem.price * dereplicatedTags[i].count;
        }
        receiptItems.push({"name": metaItem.name, "count": dereplicatedTags[i].count, "price":metaItem.price, "unit": metaItem.unit, "subTotal": subTotal});
    }
    return receiptItems;
};

const calculateTotalDiscount = (receiptItems) => {
    let totalPrice = 0;
    let sumOriginalPrice = 0;
    for (let i = 0; i < receiptItems.length; i++) {
        sumOriginalPrice += receiptItems[i].price * receiptItems[i].count;
        totalPrice += receiptItems[i].subTotal;
    }
    let totalDiscount = sumOriginalPrice - totalPrice;
    return {"receiptItems":receiptItems, "totalPrice": totalPrice, "totalDiscount": totalDiscount};
};

const generateRecord = (tags) => {
  let splitedTags = splitTag(tags);
  let dereplicatedTags = dereplication(splitedTags);
  let receiptItems = getPrice(dereplicatedTags);
  let receiptData = calculateTotalDiscount(receiptItems);
  return receiptData;
};

const getText = (receiptData) => {
    let header = "***<没钱赚商店>收据***\n";
    let body = "";
    for (let i = 0; i < receiptData.receiptItems.length; i++) {
        let tmp = "名称：" + receiptData.receiptItems[i].name + "，数量：" + receiptData.receiptItems[i].count + receiptData.receiptItems[i].unit + "，单价：" + receiptData.receiptItems[i].price.toFixed(2) + "(元)，小计：" + receiptData.receiptItems[i].subTotal.toFixed(2) + "(元)\n";
        body += tmp;
    }
    let footer = "----------------------\n";
    let totalPrice = "总计：" + receiptData.totalPrice.toFixed(2) + "(元)\n";
    let totalDiscount = "节省：" + receiptData.totalDiscount.toFixed(2) + "(元)\n";
    let stars = "**********************";
    return header + body + footer + totalPrice + totalDiscount + stars;
};

const printReceipt = (tags) => {
    if (isValid(tags)) {
        let receiptData = generateRecord(tags);
        let expectText = getText(receiptData);
        console.log(expectText);
        return expectText;
    } else {
        return null;
    }
};

module.exports = {
    printReceipt: printReceipt,
    isValid: isValid,
    splitTag: splitTag,
    dereplication: dereplication,
    isDiscount:isDiscount,
    getInfo: getInfo,
};
