import React, { useState } from 'react';
// Không cần import FormRow nữa để tránh lỗi style
import Button from '../../../components/common/Button';
import Toast from '../../../components/common/Toast';
import { triggerMonthlyAllocation } from '../../../Services/rewardService';
import { AlertCircle } from 'lucide-react'; 

const AutoAllocationConfig = () => {
    const [targetMonth, setTargetMonth] = useState(new Date().toISOString().slice(0, 7)); // Format YYYY-MM
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleTrigger = async () => {
        if (!window.confirm(`Run the process of adding points for the month ${targetMonth}?`)) return;

        setLoading(true);
        try {
            await triggerMonthlyAllocation({ targetMonth });
            setToast({ type: 'success', message: 'Process triggered successfully!' });
        } catch (error) {
            setToast({ type: 'error', message: 'System error. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Automatic Point Allocation Configuration</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-xl">
                <div className="mb-6 bg-blue-50 p-4 rounded text-blue-800 text-sm flex gap-2 items-start">
                    <AlertCircle className="mt-1 flex-shrink-0" size={20}/>
                    <p>
                        The system automatically runs on <strong>the 1st of every month</strong>. 
                        This function is only used for manual triggering in case of system issues or the need to rerun.
                    </p>
                </div>

                {}
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        {/* Manually write Label and Input to control margin */}
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select the month to rerun
                        </label>
                        <input 
                            type="month"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 h-10" // h-10 để cố định chiều cao
                            value={targetMonth}
                            onChange={e => setTargetMonth(e.target.value)}
                        />
                    </div>
                    
                    {/* Button nằm trực tiếp trong flex container, không bọc div ngoài */}
                    <Button 
                        variant="danger"
                        onClick={handleTrigger} 
                        disabled={loading}
                        className="h-10 mb-[1px]" // h-10 để bằng chiều cao input
                    >
                        {loading ? 'Running...' : 'Trigger Now'}
                    </Button>
                </div>
            </div>
            
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AutoAllocationConfig;