import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dna: null,
  loading: false,
  error: "",
};

const tasteDnaSlice = createSlice({
  name: "tasteDna",
  initialState,
  reducers: {},
});

export default tasteDnaSlice.reducer;
