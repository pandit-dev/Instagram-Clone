import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState: {
    newNotification: [],
  },
  reducers: {
    setNewNotification: (state, action) => {
      if (action.payload.type === "like") {
        state.newNotification.push(action.payload);
      } else if (action.payload.type === "unlike") {
        state.newNotification = state.newNotification.filter(
          (item) => item.userId !== action.payload.userId
        );
      } else if (action.payload.type === "comment") {
        state.newNotification.push(action.payload);
      }
    },
  },
});

export const { setNewNotification } = rtnSlice.actions;
export default rtnSlice.reducer;
