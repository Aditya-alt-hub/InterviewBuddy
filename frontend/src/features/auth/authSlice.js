

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/users/`;

const savedUser = JSON.parse(localStorage.getItem("user"));

const initialState = {
  user: savedUser || null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  isProfileLoading: false,
  message: "",
};

const saveUser = (data) => {
  localStorage.setItem("user", JSON.stringify(data));
};

const removeUser = () => {
  localStorage.removeItem("user");
};

export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}register`, userData);

      if (response.data) {
        saveUser(response.data);
      }

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}login`, userData);

const userDataResponse = response.data.user;

localStorage.setItem("user", JSON.stringify(userDataResponse));

return userDataResponse;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkAPI.rejectWithValue(message);
  }

});

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (token, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}google-login`, { token });

      const userData = response.data.user || response.data;

      if (userData) {
        saveUser(userData);
      }

      return userData;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  removeUser();
  return null;
});

export const updateProfile = createAsyncThunk(
  "auth/update",
  async (userData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;

      if (!token) {
        return thunkAPI.rejectWithValue("No token found. Please login again.");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(`${API_URL}update`, userData, config);

      const updatedUser = {
        ...thunkAPI.getState().auth.user,
        ...response.data,
      };

      saveUser(updatedUser);

      return updatedUser;
    } catch (error) {
      if (error.response?.status === 401) {
        removeUser();
      }

      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        removeUser();
      })

      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        removeUser();
      })

      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        removeUser();
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })

      .addCase(updateProfile.pending, (state) => {
        state.isProfileLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.isError = true;
        state.message = action.payload;

        if (action.payload?.includes("token")) {
          state.user = null;
        }
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;