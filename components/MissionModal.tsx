import React, { useEffect, useState } from 'react';
import { X, Trash2, Map, Calendar, Upload } from 'lucide-react';
import { missionService, MissionSummary } from '../services/missionService';

interface MissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadMission: (missionId: string) => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({ isOpen, onClose, onLoadMission }) => {
    const [missions, setMissions] = useState<MissionSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchMissions();
        }
    }, [isOpen]);

    const fetchMissions = async () => {
        setLoading(true);
        try {
            const data = await missionService.getAll();
            setMissions(data);
        } catch (err) {
            setError('無法載入任務列表');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('確定要刪除此任務嗎？')) return;

        try {
            await missionService.delete(id);
            setMissions(missions.filter(m => m.id !== id));
        } catch (err) {
            alert('刪除失敗');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Map className="text-primary" />
                        我的任務
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-full text-gray-500">
                            載入中...
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500">{error}</div>
                    ) : missions.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            尚無儲存的任務
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {missions.map((mission) => (
                                <div
                                    key={mission.id}
                                    onClick={() => {
                                        onLoadMission(mission.id);
                                        onClose();
                                    }}
                                    className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary hover:shadow-md cursor-pointer transition-all bg-white"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <Map size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                                                {mission.name}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {new Date(mission.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            onClick={(e) => handleDelete(e, mission.id)}
                                            title="刪除"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button className="p-2 text-primary bg-primary/10 rounded-full">
                                            <Upload size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
