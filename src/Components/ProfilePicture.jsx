import React from "react";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export const ProfilePicture = () => {

  const { user, loading } = useAuth();


  if (loading) {
    return <LoadingSpinner />; // Loading state
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <h2 className="text-xl text-red-500">User not authenticated!</h2>
      </div>
    );
  }
  return (
    <div className="relative md:hidden  flex flex-col items-center justify-center sm:-mt-16 mt-0">
      <div className="w-24 h-24 border-2 rounded-full shadow-lg flex justify-center items-center">
        <img
          src={user.imageUrl || "/Image/new.jpeg"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover"
        />
      </div>
      <span className="">
        Welcome{" "}
        <span className="font-semibold">
          {user.lastName} {user.firstName}
        </span>{" "}
      </span>
      <span className="text-sm text-customGray">{user.lastLogin}</span>
    </div>
  );};