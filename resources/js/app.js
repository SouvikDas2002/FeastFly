
let addToCart = document.getElementsByClassName('add-to-cart');

let cartCounter=document.getElementById("cartCounter");

const updateCart=async (item)=>{
    // console.log(cartItem);
    const cartItem=await axios.post('/update-cart',item)
    cartCounter.innerText=cartItem.data.totalQty;
    Toastify({
        text: `${cartItem.data.totalQty} added to your cart`,
        duration:2000,
        className: "info",
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();
    
}

for (let i = 0; i < addToCart.length; i++) {
    addToCart[i].onclick = () => {
        const itemData=JSON.parse(addToCart[i].dataset.items);
        updateCart(itemData)
        // console.log(itemData);
    };
}


