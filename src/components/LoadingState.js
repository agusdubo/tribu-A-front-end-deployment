import React from 'react';
import { Loader } from 'lucide-react';

const LoadingState = ({ message = "Cargando..." }) => {
    return (
        <div className="flex flex-col items-center justify-center p-10">
            <Loader className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">{message}</p>
        </div>
    );
};

export default LoadingState;