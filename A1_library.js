"use strict";
const log = console.log;

let numOfItems = 0;
let subTotal = 0;
let discount = 0;
let taxRate = 0;
const cart = []

class item {
	constructor(name, price) {
        this.name = name;
		this.price = price;
        this.qty = 1;
        this.discount = 0;

        this.id = numOfItems;
        numOfItems++;
    }

}

const ItemAddForm = document.querySelector('#itemAddForm');
const DiscountForm = document.querySelector('#DiscountForm');
const TaxRateForm = document.querySelector('#TaxRateForm');
const taxError = document.getElementById("TaxErrorPopup");
const disocuntError = document.getElementById("DiscountErrorPopup");
const itemError = document.getElementById("ItemErrorPopup");
const QtyError = document.getElementById("QtyErrorPopup");

const taxClose = document.querySelector("#Taxclose");
const discountClose = document.querySelector("#Discountclose");
const itemClose = document.querySelector("#Itemclose");
const QtyClose = document.querySelector("#Qtyclose");


ItemAddForm.addEventListener('submit', addNewItemToCart); 
DiscountForm.addEventListener('submit', applyDiscount);
TaxRateForm.addEventListener('submit', applyTaxRate);
taxClose.addEventListener("click", closePopup);
discountClose.addEventListener("click", closePopup);
itemClose.addEventListener("click", closePopup);
QtyClose.addEventListener("click", closePopup);

const itemEntries = document.querySelector('#itemTable');
itemEntries.addEventListener('click', deleteItem);
itemEntries.addEventListener('change', ChangeQuantity);


function addNewItemToCart(e){
    e.preventDefault();

    const itemName = document.querySelector('#newItemName').value;
	const itemPrice = document.querySelector('#newItemPrice').value;
    if(Number.isFinite(parseFloat(itemPrice)) && parseFloat(itemPrice) >= 0){
        const newItem = new item(itemName, itemPrice);
        cart.push(newItem);
        const inter = parseFloat(newItem.price).toFixed(2);
        const inter2 = subTotal + parseFloat(inter);
        subTotal = parseFloat(inter2.toFixed(2));

        generateNewItem(newItem);
        updateTotal();
        document.getElementById('newItemName').value = ''
        document.getElementById('newItemPrice').value = ''
    }else{
        document.getElementById('newItemName').value = ''
        document.getElementById('newItemPrice').value = ''
        ItemErrorPopup()
    }
    

}

function deleteItem(e){
    e.preventDefault();

    var itemId = -1;
    if(e.target.classList.contains('delete')){
		const deleteRow = e.target.parentElement.parentElement;
        itemId = deleteRow.cells[0].id;
        const price = deleteRow.cells[3].innerText;
        const qty = cart[itemId].qty;
        const inter = parseFloat(price).toFixed(2);
        const inter2 = subTotal - (parseFloat(inter) * qty);
        subTotal = parseFloat(inter2.toFixed(2));
        const inter3 = discount - cart[itemId].discount;
        discount = parseFloat(inter3.toFixed(2));
        const tbody = deleteRow.parentElement;
        tbody.removeChild(deleteRow);
	}
    cart[itemId] = null
    updateTotal()
}

function applyTaxRate(e){
    e.preventDefault();

    taxRate = parseFloat(document.querySelector('#taxRateInput').value);
    if(Number.isFinite(taxRate) == true && taxRate >= 0){
        updateTotal();
    }else{
        taxRate = 0;
        document.getElementById('taxRateInput').value = ''
        taxErrorPopup();
    }

}

function applyDiscount(e){
    e.preventDefault();
    
    const discountPercent = parseFloat(document.querySelector('#discountInput').value);
    if(Number.isFinite(discountPercent) == true && discountPercent >= 0 && discountPercent <= 100){
        const nowPercent = 100-discountPercent;
        subTotal = 0;
        // update the items that are being discounted and update the price label in red instead of black.
        for(let i = 0; i < cart.length; i++){
            if(cart[i] != null){
                const inter2 =  cart[i].price * nowPercent /100;
                const orginalPrice = cart[i].price;
                cart[i].price = parseFloat(inter2.toFixed(2));
                const amountDiscount = (orginalPrice - cart[i].price) * cart[i].qty;
                const inter3 = subTotal + cart[i].price * cart[i].qty;
                subTotal = parseFloat(inter3.toFixed(2));
                const inter4 = discount + parseFloat(amountDiscount.toFixed(2))
                discount = parseFloat(inter4.toFixed(2));
                cart[i].discount += parseFloat(amountDiscount.toFixed(2));
            }
        }
        updateTotal();
        updateSaleItem();
    }else{
        document.getElementById('discountInput').value = ''
        discountErrorPopup();
    }

}

function updateSaleItem(){

    const tableBody = document.getElementById('itemTable').children[0];
    for(let i=0; i < tableBody.rows.length; i++){
        tableBody.rows[i].cells[3].className = 'SalePrice'; 
        const itemId = parseInt(tableBody.rows[i].cells[0].id);
        tableBody.rows[i].cells[3].innerHTML = cart[itemId].price; 
    }

}

function generateNewItem(item){
    item.preventDefault;
    
    const tableBody = document.getElementById('itemTable').children[0];
    const newrow = tableBody.insertRow();

    const itemcell = newrow.insertCell()
    itemcell.className = 'item';
    itemcell.id = item.id;
    const itemName = document.createTextNode(item.name)
	itemcell.appendChild(itemName)

    const deletecell = newrow.insertCell();
    deletecell.className = 'deleteCell';
    const deletebutton = document.createElement('button');
    deletebutton.className = 'delete';
    const deleteText = document.createTextNode('delete');
    deletebutton.appendChild(deleteText);
	deletecell.appendChild(deletebutton);

    const qtyCell = newrow.insertCell();
    qtyCell.className = 'qtyCell';
    const inputBox = document.createElement('input');
    inputBox.setAttribute("type", "text");
    inputBox.setAttribute("value", "1");
    inputBox.className = 'inputs';
    qtyCell.appendChild(inputBox);

    const pricecell = newrow.insertCell()
    pricecell.className = 'price';
    const itemPrice = document.createTextNode(item.price)
	pricecell.appendChild(itemPrice)
    
}

function ChangeQuantity(e){
    e.preventDefault();

    if(e.target.classList.contains('inputs')){
        if( /^\d+$/.test(e.target.value) && e.target.value > 0){
            log(parseFloat(e.target.value))
            const row = e.target.parentElement.parentElement;
            const itemID = row.cells[0].id
            const oldQty = cart[itemID].qty;
            cart[itemID].qty = parseInt(e.target.value);
            const inter = (parseInt(e.target.value) - oldQty) * cart[itemID].price;
            const inter2 = subTotal + parseFloat(inter.toFixed(2));
            subTotal = parseFloat(inter2.toFixed(2));
            const inter3 = (parseInt(e.target.value) - oldQty) * (cart[itemID].discount/oldQty);
            cart[itemID].discount += parseFloat(inter3.toFixed(2));
            const inter4 = discount + parseFloat(inter3.toFixed(2));
            discount = parseFloat(inter4.toFixed(2));
        }else{
            QtyErrorPopup()
        }
    }

    updateTotal();

}

function QtyErrorPopup(){
    QtyError.style.display = "block";
}

function ItemErrorPopup(){
    itemError.style.display = "block";
}

function taxErrorPopup(){
    taxError.style.display = "block";
}

function discountErrorPopup(){
    disocuntError.style.display = "block";
}

function closePopup(e){
    const toBeClosed = e.target.parentElement.parentElement;
    toBeClosed.style.display = "none";
}

function updateTotal(){
    
    document.getElementById('subtotal').innerText = `${subTotal}`;
    document.getElementById('discount').innerText = `${discount}`;
    const tax = taxRate / 100;
    const inter = subTotal * parseFloat(tax.toFixed(2));
    const sumTaxes = parseFloat(inter.toFixed(2));
    document.getElementById('taxes').innerText = `${sumTaxes}`;
    const inter2 = subTotal + sumTaxes;
    const totalSum = parseFloat(inter2.toFixed(2));
    document.getElementById('Total').innerText = `${totalSum}`;

}


