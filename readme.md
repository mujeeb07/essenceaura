    <section class="section-padding footer-mid">
        <div class="row">
            <div class="container pt-15 pb-20">
                <section class="banner-2 section-padding pb-0"></section>
                    <div class="container">
                        <div class="banner-img banner-big wow fadeIn animated f-none">
                            <img src="../../public/user_asset/imgs/banner/banner-4.png" alt="img">
                            <div class="banner-text d-md-block d-none">
                                <h4 class="mb-15 mt-40 text-brand">Repair Services</h4>
                                <h1 class="fw-600 mb-20">We're an Apple <br>Authorised Service Provider</h1>
                                <a href="shop-grid-right.html" class="btn">Learn More <i class="fi-rs-arrow-right"></i></a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </section>

    <div class="widget-category mb-30">
                            <h5 class="section-title style-1 mb-10 wow fadeIn animated">Category</h5>
                            <ul class="categories">
                                <li><a href="/shoping_page">All Categories</a></li> <!-- Link for showing all products -->
                                <% categories.forEach((cat) => { %>
                                    <li><a href="/shoping_page?categoryId=<%= cat._id %>"><%= cat.name %></a></li>
                                <% }) %>
                            </ul>
                            <!-- Price Filter -->
                            <div class="widget-header position-relative pb-10">
                                <h5 class="section-title style-1 mb-10 mt-15 wow fadeIn animated">Price </h5>
                            </div>
                            <div class="custome-checkbox">
                                <input class="form-check-input" type="checkbox" name="checkbox" id="exampleCheckbox1" value="">
                                <label class="form-check-label" for="exampleCheckbox1"><span>Low to High</span></label>
                                <br>
                                <input class="form-check-input" type="checkbox" name="checkbox" id="exampleCheckbox2" value="">
                                <label class="form-check-label" for="exampleCheckbox2"><span>High to Low</span></label>
                                <br>
                            </div>
                            <div class="widget-header position-relative pb-10">
                                <h5 class="section-title style-1 mb-10 mt-15 wow fadeIn animated">Brand </h5>
                            </div>
                            <div class="custome-checkbox">
                                <input class="form-check-input" type="checkbox" name="checkbox" id="exampleCheckbox11" value="">
                                <label class="form-check-label" for="exampleCheckbox11"><span>New (1506)</span></label>
                                <br>
                            </div>
                            <a href="shop-grid-right.html" class="btn btn-sm btn-default"><i class="fi-rs-filter mr-5"></i> Fillter</a>
                            
                        </div>




// document.getElementById("shop_cart").addEventListener("click", async () => {
//     try {
//         const productId = document.getElementById('productId').value;
//         const quantity = document.getElementById('quantity').value;
//         console.log(quantity)
//         const postData = {
//             product_id: productId,
//             price: selectedSize.price,
//             volume: selectedSize.volume,
//             stock:  selectedSize.stock,
//             quantity: parseInt(quantity, 10)
//         };
//         console.log(postData)
// 
//         const response = await fetch("/shop_cart", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(postData)
//         });
// 
//         if (response.ok) {
//             Swal.fire({
//                 icon: 'success',
//                 title: 'Product added to cart',
//                 showConfirmButton: true,
//                 confirmButtonText: 'ok'
//             }).then((result) => {
//                 if (result.isConfirmed) {
//                     window.location.href = "/shop_cart";
//                 }
//             });
//         } else {
//             const errorData = await response.json();
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Failed to add to cart',
//                 text: errorData.message || 'Please try again later.',
//                 confirmButtonText: 'OK'
//             });
//         }
//     } catch (error) {
//         console.error("Error adding product to cart:", error);
//         Swal.fire({
//             icon: 'error',
//             title: 'Something went wrong',
//             text: 'Please try again later',
//             confirmButtonText: 'OK'
//         });
//     }
// });
// 
// document.getElementById("shop_cart").addEventListener("click", async () => {
//     try {
//         const productId = document.getElementById('productId').value;
//         const quantity = document.getElementById('quantity').value;
//         console.log(quantity);
//         const postData = {
//             product_id: productId,
//             price: selectedSize.price,
//             volume: selectedSize.volume,
//             quantity: parseInt(quantity, 10)
//         };
// 
//         const response = await fetch("/shop_cart", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(postData)
//         });
// 
//         if (response.ok) {
//             Swal.fire({
//                 icon: 'success',
//                 title: 'Product added to cart',
//                 showConfirmButton: true,
//                 confirmButtonText: 'View Cart'
//             }).then((result) => {
//                 if (result.isConfirmed) {
//                     window.location.href = "/shop_cart";
//                 }
//             });
//         } else {
//             const errorData = await response.json();
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Failed to add to cart',
//                 text: errorData.message || 'Please try again later.',
//                 confirmButtonText: 'OK'
//             });
//         }
//     } catch (error) {
//         console.error("Error adding product to cart:", error);
//         Swal.fire({
//             icon: 'error',
//             title: 'Something went wrong',
//             text: 'Please try again later',
//             confirmButtonText: 'OK'
//         });
//     }
// });

    <option value="">Choose a state</option>
    <option value="Andhra Pradesh">Andhra Pradesh</option>
    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
    <option value="Assam">Assam</option>
    <option value="Bihar">Bihar</option>
    <option value="Chhattisgarh">Chhattisgarh</option>
    <option value="Goa">Goa</option>
    <option value="Gujarat">Gujarat</option>
    <option value="Haryana">Haryana</option>
    <option value="Himachal Pradesh">Himachal Pradesh</option>
    <option value="Jharkhand">Jharkhand</option>
    <option value="Karnataka">Karnataka</option>
    <option value="Kerala">Kerala</option>
    <option value="Madhya Pradesh">Madhya Pradesh</option>
    <option value="Maharashtra">Maharashtra</option>
    <option value="Manipur">Manipur</option>
    <option value="Meghalaya">Meghalaya</option>
    <option value="Mizoram">Mizoram</option>
    <option value="Nagaland">Nagaland</option>
    <option value="Odisha">Odisha</option>
    <option value="Punjab">Punjab</option>
    <option value="Rajasthan">Rajasthan</option>
    <option value="Sikkim">Sikkim</option>
    <option value="Tamil Nadu">Tamil Nadu</option>
    <option value="Telangana">Telangana</option>
    <option value="Tripura">Tripura</option>
    <option value="Uttar Pradesh">Uttar Pradesh</option>
    <option value="Uttarakhand">Uttarakhand</option>
    <option value="West Bengal">West Bengal</option>
    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
    <option value="Chandigarh">Chandigarh</option>
    <option value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</option>
    <option value="Daman and Diu">Daman and Diu</option>
    <option value="Lakshadweep">Lakshadweep</option>
    <option value="Delhi">Delhi</option>
    <option value="Puducherry">Puducherry</option>
    <option value="Ladakh">Ladakh</option>
    <option value="Jammu and Kashmir">Jammu and Kashmir</option>



    <div class="col-lg-5">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h4 class="mb-4">Order Summary</h4>
            <table class="table">
                <tbody>
                  <!-- Subtotal and GST Calculation -->
                  <% let subtotal = 0; %>
                  <% let total_tax = 0; %>
              
                  <% cartItems.forEach(function(item) { %>
                    <!-- Extract Base Price (excluding tax) -->
                    <% let basePrice = item.price / 1.18; %>
                    
                    <!-- Calculate the tax for the item -->
                    <% let itemTax = item.price - basePrice; %>
                    
                    <!-- Add the base price to subtotal -->
                    <% subtotal += basePrice * item.quantity; %>
              
                    <!-- Add the tax amount to the total tax -->
                    <% total_tax += itemTax * item.quantity; %>
                  <% }); %>
              
                  <!-- Table Rows -->
                  <tr>
                    <td>Subtotal (Excluding Tax)</td>
                    <td class="text-right">₹ <%= subtotal.toFixed(2) %></td>
                  </tr>
                  <tr>
                    <td>Taxes <span class="text-muted">( GST 18%)</span></td>
                    <td class="text-right">₹ <%= total_tax.toFixed(2) %></td>
                  </tr>
                  <tr>
                    <td>Shipping (<%= cartItems.length %> Items)</td>
                    <td class="text-right">Free</td>
                  </tr>                  
                  <tr>
                    <td><strong>Total</strong></td>
                    <td class="text-right"><strong>₹ <%= (subtotal + total_tax ).toFixed(2) %></strong></td>
                  </tr>
                </tbody>
              </table>
              
            <!-- Promo Code Section -->
            <!-- <div class="mt-4">
              <button class="btn btn-light btn-block">Apply a Promo Code or Discount</button>
            </div> -->
  
            <!-- Bag Summary -->
            <div class="mt-10">
                <h5 class="mt-10 mb-10">Bag Summary (<%= cartItems.length %>)</h5>
                <% cartItems.forEach(function(item) { %>
                  <div class="d-flex mb-3">
                    <img src="<%= item.product.product_card_image %>" class="d-block h-25 w-25" alt="Product Image" width="60">
                    <div class="ml-3">
                      <p class="mb-0"><%= item.product.name %> x <%= item.quantity %></p>
                      <small>Volume: <%= item.volume %> ml</small><br>
                      <strong>₹ <%= item.price %></strong>
                     
                    </div>
                  </div>
                <% }); %>
              </div>
              <div class="payment-options">
                <h3>Select Payment Method</h3>
            
                <div class="payment-method">
                    <input type="radio" id="cod" name="payment" value="COD">
                    <label for="cod">Cash on Delivery (COD)</label>
                </div>
            
                <div class="payment-method">
                    <input type="radio" id="credit-card" name="payment" value="Credit Card">
                    <label for="credit-card">Credit Card</label>
                </div>
            
                <div class="payment-method">
                    <input type="radio" id="debit-card" name="payment" value="Debit Card">
                    <label for="debit-card">Debit Card</label>
                </div>
            
                <div class="payment-method">
                    <input type="radio" id="net-banking" name="payment" value="Net Banking">
                    <label for="net-banking">Net Banking</label>
                </div>
            </div>
              
          </div>
        </div>
        <button id="placeOrder" class="btn btn-block mt-4 mb-15">Place Order</button>
      </div>