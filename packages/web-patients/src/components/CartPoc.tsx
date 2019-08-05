import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import { useShoppingCart } from 'components/ShoppingCartProvider';

export const CartPoc: React.FC = (props) => {
  const { items, addItem, removeItem, total } = useShoppingCart();
  return (
    <div style={{ color: 'black', padding: 30 }}>
      <h2>Shopping Cart POC</h2>
      <h3>Total: ₹{total}</h3>
      <button
        onClick={() => {
          const id = _uniqueId('cart-item-');
          addItem({
            id,
            name: `Some Medicine ${id}`,
            description: 'Take 1-2 tablets daily',
            price: Math.floor(Math.random() * 500),
            quantity: Math.floor(Math.random() * 5),
            forPatientId: `${Math.floor(Math.random() * 50)}`,
            subscribed: Boolean(Math.floor(Math.random() * 2)),
          });
        }}
      >
        Add Item
      </button>
      <br />
      <br />
      {items.map((item) => (
        <div>
          <div>
            <b>{item.name}</b>
          </div>
          <div>{item.description}</div>
          <div>{item.quantity} Packs</div>
          <div>For Patient ID: {item.forPatientId}</div>
          <div>
            Need to take this regularly? <input type="checkbox" checked={item.subscribed} />
          </div>
          <button onClick={() => removeItem(item.id)}>remove</button>
          <hr />
        </div>
      ))}
    </div>
  );
};
