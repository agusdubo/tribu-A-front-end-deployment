import React from 'react';
import { useNavigate } from 'react-router-dom';

const CardModule = ({ icon: Icon, title, description, bgColor, path, disabled = false }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (!disabled && path) {
            navigate(path);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`group block p-8 bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300 ${
                disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:shadow-lg hover:-translate-y-1'
            }`}
        >
            <div className="flex flex-col items-center text-center">
                <div className={`flex items-center justify-center h-24 w-24 rounded-full ${bgColor} ${!disabled && 'group-hover:bg-opacity-80'} transition-colors duration-300`}>
                    <Icon className="h-12 w-12 text-white" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                    {title}
                </h2>
                <p className="mt-2 text-base text-gray-500">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default CardModule;