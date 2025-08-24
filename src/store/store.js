// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import doctorsSlice from "./slices/doctorsSlice";
import medicinesSlice from "./slices/medicinesSlice";
import salesSlice from "./slices/salesSlice";
import dashboardSlice from "./slices/dashboardSlice";
import suppliersSlice from "./slices/suppliersSlice";
import productsSlice from "./slices/productsSlice";
import statisticsSlice from "./slices/statisticsSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    doctors: doctorsSlice,
    medicines: medicinesSlice,
    sales: salesSlice,
    dashboard: dashboardSlice,
    suppliers: suppliersSlice,
    products: productsSlice,
    statistics: statisticsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export const RootState = store.getState;
export const AppDispatch = store.dispatch;
