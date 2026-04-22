import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  results: [],
  loading: false,
  error: "",
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {},
});

export default searchSlice.reducer;
