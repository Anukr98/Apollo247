import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import { useShoppingCart } from '@aph/shared-ui-components/ShoppingCartProvider';

export const CartPoc: React.FC = (props) => {
  const { items, addItem, removeItem, updateItem, total } = useShoppingCart();
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
            quantity: Math.floor(Math.random() * 5) + 1,
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
        <div key={item.id}>
          <div>
            <b>
              {item.name} - ₹{item.price}
            </b>
          </div>
          <div>{item.description}</div>
          <div>
            <button
              style={{ display: 'inline-block' }}
              disabled={item.quantity === 1}
              onClick={() => updateItem({ id: item.id, quantity: item.quantity - 1 })}
            >
              -
            </button>
            <div style={{ display: 'inline-block' }}>{item.quantity} Packs</div>
            <button
              style={{ display: 'inline-block' }}
              onClick={() => updateItem({ id: item.id, quantity: item.quantity + 1 })}
            >
              +
            </button>
          </div>
          <div>For Patient ID: {item.forPatientId}</div>
          <div>
            Need to take this regularly?
            <input
              type="checkbox"
              checked={item.subscribed}
              onChange={(e) => updateItem({ id: item.id, subscribed: e.currentTarget.checked })}
            />
          </div>
          <button onClick={() => removeItem(item.id)}>remove</button>
          <hr />
        </div>
      ))}
    </div>
  );
};
