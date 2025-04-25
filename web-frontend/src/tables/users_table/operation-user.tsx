import React, { useState, useEffect } from 'react';
import { useFirebaseStorage, getItemName, getUsername, getSpeech, uploadImage } from '@/services/firebase';
import { User } from '@/data_types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Mock function to handle image list updates since it's missing from AuthContext
const mockUpdateImageList = (newImage: string) => {
  console.log("Updating image list with:", newImage);
  // In a real implementation, this would update the image list in the context
};

const UserOperations = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (data: any) => {
    if (!data.photoFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      const userPhotoName = `users/${currentUser?.id || 'unknown'}/profile.jpg`;
      const downloadURL = await uploadImage(data.photoFile, userPhotoName);
      
      // Use mock function instead of missing context function
      mockUpdateImageList(downloadURL);
      
      toast({
        title: "Success",
        description: "Profile photo uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload profile photo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Operations</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Upload Profile Photo</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      
      <button
        onClick={() => selectedFile && handleUpload({ photoFile: selectedFile })}
        disabled={!selectedFile}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
      >
        Upload Photo
      </button>
    </div>
  );
};

export default UserOperations;
