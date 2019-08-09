"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
exports.ShoppingCartContext = react_1.createContext({
    cartItems: [],
    addCartItem: null,
    removeCartItem: null,
    updateCartItem: null,
    cartTotal: 0,
});
exports.ShoppingCartProvider = function (props) {
    var _a = react_1.useState([]), cartItems = _a[0], setCartItems = _a[1];
    var addCartItem = function (itemToAdd) {
        return setCartItems(cartItems.concat([itemToAdd]));
    };
    var removeCartItem = function (id) {
        return setCartItems(cartItems.filter(function (item) { return item.id !== id; }));
    };
    var updateCartItem = function (itemUpdates) {
        var foundIndex = cartItems.findIndex(function (item) { return item.id == itemUpdates.id; });
        if (foundIndex !== -1) {
            cartItems[foundIndex] = __assign({}, cartItems[foundIndex], itemUpdates);
            setCartItems(cartItems.slice());
        }
    };
    var cartTotal = cartItems.reduce(function (currTotal, currItem) { return currTotal + currItem.quantity * currItem.price; }, 0);
    return (react_1.default.createElement(exports.ShoppingCartContext.Provider, { value: {
            cartItems: cartItems,
            addCartItem: addCartItem,
            removeCartItem: removeCartItem,
            updateCartItem: updateCartItem,
            cartTotal: cartTotal,
        } }, props.children));
};
var useShoppingCartContext = function () { return react_1.useContext(exports.ShoppingCartContext); };
exports.useShoppingCart = function () { return ({
    cartItems: useShoppingCartContext().cartItems,
    addCartItem: useShoppingCartContext().addCartItem,
    removeCartItem: useShoppingCartContext().removeCartItem,
    updateCartItem: useShoppingCartContext().updateCartItem,
    cartTotal: useShoppingCartContext().cartTotal,
}); };
//# sourceMappingURL=ShoppingCartProvider.js.map