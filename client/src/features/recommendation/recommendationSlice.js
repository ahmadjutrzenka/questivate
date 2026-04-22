import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  results: [],
  loading: false,
  error: "",
};

const recommendationSlice = createSlice({
  name: "recommendation",
  initialState,
  reducers: {},
});

export const recommendationReducer = recommendationSlice.reducer;
export default recommendationReducer;
