function refund(balance, quantity, sub_total, remaining_tax, remaining_discount) {
    const proportion = (balance * quantity) / sub_total;
    const product_discount = remaining_discount * proportion;
    const effective_price = (balance * quantity) - product_discount;
    const product_tax = (effective_price / sub_total) * remaining_tax;
    const refund_amount = effective_price + product_tax;

    // Update remaining values
    remaining_discount -= product_discount;
    remaining_tax -= product_tax;

    return { refund_amount, remaining_discount, remaining_tax };
}

module.exports = refund;
