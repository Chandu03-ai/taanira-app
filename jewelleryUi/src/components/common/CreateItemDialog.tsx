import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface CreateItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  title: string;
  type: 'category' | 'tag';
}

const CreateItemDialog: React.FC<CreateItemDialogProps> = ({ isOpen, onClose, onSave, title, type }) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Name is required');
      return;
    }
    onSave(name.trim(), type === 'category' ? description.trim() : undefined);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
      
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md"
              placeholder={`Enter ${type === 'category' ? 'category' : 'tag'} name`}
            />
          </div>

          {type === 'category' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md"
                placeholder="Enter category description"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 inline-block mr-2" />
            Create {type === 'category' ? 'Category' : 'Tag'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateItemDialog;
