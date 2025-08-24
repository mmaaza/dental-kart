import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { 
  Root as Card, 
  Content as CardContent, 
  Header as CardHeader, 
  Title as CardTitle 
} from '../../components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../components/ui/dialog';
import {
  Trash2,
  Settings2,
  AlertTriangle
} from 'lucide-react';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteAccount = () => {
    // Implementation for deleting account
    console.log('Deleting account...');
    setShowDeleteDialog(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings2 className="h-5 w-5 sm:h-6 sm:w-6" />
            Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account settings</p>
        </div>
      </div>



      {/* Danger Zone */}
      <Card className="border-red-200 shadow-mobile hover:shadow-mobile-lg transition-all duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg font-medium text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            Danger Zone
          </CardTitle>
          <p className="text-sm text-gray-500">Irreversible and destructive actions</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-700">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Are you sure you want to delete your account? This action is permanent and cannot 
                    be undone. All your data, orders, and preferences will be lost.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-4">
                  <p className="text-sm text-red-800 font-medium">This will permanently:</p>
                  <ul className="text-sm text-red-700 mt-1 ml-4 list-disc">
                    <li>Delete your profile and account data</li>
                    <li>Remove your order history</li>
                    <li>Cancel any active subscriptions</li>
                    <li>Delete your wishlist and preferences</li>
                  </ul>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteDialog(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Yes, Delete Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;