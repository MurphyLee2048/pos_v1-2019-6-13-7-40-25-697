'use strict';
const loadAllItems = require('../__test__/fixtures').loadAllItems;
const loadPromotions = require('../__test__/fixtures').loadPromotions;

function printReceipt(tags) {
    return `***<没钱赚商店>收据***
名称：雪碧，数量：5瓶，单价：3.00(元)，小计：12.00(元)
名称：荔枝，数量：2.5斤，单价：15.00(元)，小计：37.50(元)
名称：方便面，数量：3袋，单价：4.50(元)，小计：9.00(元)
----------------------
总计：58.50(元)
节省：7.50(元)
**********************`;
}

function isValid(tags) {
    for (let i = 0; i < tags.length; i++) {
        if (isBarcodeValid(tags[i].substr(0, 10)) === false) {

            return false;
        }
    }
    return true;
}；

const isBarcodeValid = (tag) => {
    const allItems = loadAllItems();  // TODO: allItems可以全局化
    for (let i = 0; i < allItems.length; i++) {
        if (tag === allItems[i].barcode) {

            return true;
        }
    }
    return false;
};

const splitTag = (tag) => {
    let barcode = "";
    let count = 1;
    if (tag.indexOf('-') === -1) {
        barcode = tag;
    } else {
        let tmp = tag.split('-');
        barcode = tmp[0];
        count = Number(tmp[1]);
    }
    return {"barcode": barcode, "count": count};
};

const dereplication = (splitedTags) => {
    let map = new Map();
    for (let i = 0; i < splitedTags.length; i++) {

        let tmpStr = splitedTags[i].barcode;
        if (map.has(tmpStr)) {
            map.set(tmpStr, map.get(tmpStr) + splitedTags[i].count);
        } else {
            map.set(tmpStr, splitedTags[i].count);
        }
    }
    let dereplicatedTags = [];
    for (var [key, value] of map.entries()) {
        dereplicatedTags.push({"barcode": key, "count": value})
    }

    return dereplicatedTags;

};

const doCount = (tags) => {
    let splitedTags = [];
    for (let i = 0; i < tags.length; i++) {
        splitedTags.push(splitTag(tags[i]));

    }

    return dereplication(splitedTags);
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
