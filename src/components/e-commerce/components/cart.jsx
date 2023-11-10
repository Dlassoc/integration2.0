import { useUserContext } from "../../../context";

const Cart = ({ products, handleVisibility }) => {
  // Obtén el contexto del usuario para acceder y actualizar los datos del carrito
  const { userData, setUserData } = useUserContext();

  // Maneja la acción de agregar un producto al carrito
  const handleAdd = (id) => {
    setUserData((lastValue) => {
      const cartItem = lastValue.cart[id];

      // Verifica si la cantidad tomada ya alcanzó el límite disponible
      if (cartItem.unitsTaken === cartItem.units) {
        return lastValue; // No se permite agregar más unidades
      }

      // Incrementa la cantidad tomada y actualiza el carrito
      cartItem.unitsTaken += 1;
      return { ...lastValue, cart: { ...lastValue.cart, [id]: cartItem } };
    });
  };

  // Maneja la acción de reducir la cantidad de un producto en el carrito
  const handleMinus = (id) => {
    setUserData((lastValue) => {
      const cartItem = lastValue.cart[id];

      // Verifica si la cantidad tomada es 1, en cuyo caso se elimina el producto del carrito
      if (cartItem.unitsTaken === 1) {
        const { [id]: itemOut, ...newCart } = lastValue.cart;
        return { ...lastValue, cart: newCart };
      }

      // Reduz la cantidad tomada y actualiza el carrito
      cartItem.unitsTaken -= 1;
      return { ...lastValue, cart: { ...lastValue.cart, [id]: cartItem } };
    });
  };

  return (
    <aside className="shopping-cart">
      {/* Botón para cerrar el carrito */}
      <input
        className="close"
        type="button"
        value="x"
        onClick={handleVisibility}
      />
      {/* Lista de productos en el carrito */}
      <article>
        {Object.values(products).map(({ name, price, unitsTaken, image }) => (
          <section key={crypto.randomUUID()}>
            <img src={image} alt="" />
            <div>
              <p>{name}</p>
              <p>
                {/* Muestra el precio total del producto en función de la cantidad tomada */}
                {(price * unitsTaken).toLocaleString("en", {
                  style: "currency",
                  currency: "USD",
                })}
              </p>
              <p>Cantidad: {unitsTaken}</p>
            </div>
            <div className="right">
              {/* Botones para incrementar y reducir la cantidad de productos en el carrito */}
              <button onClick={() => handleAdd(name)}>+</button>
              <button onClick={() => handleMinus(name)}>-</button>
            </div>
          </section>
        ))}
      </article>
      {/* Botón de compra */}
      <input
        type="button"
        value="Purchase"
        className={`purchase ${Object.keys(userData?.cart).length !== 0 && "green"}`}
        disabled={Object.keys(userData?.cart).length === 0}
        onClick={() => console.log(Object.keys(userData?.cart).length !== 0)}
      />
    </aside>
  );
};

export default Cart;
