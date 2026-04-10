import React, { useState, useEffect } from 'react';
import { mockDb, User } from '../store/mockDb';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { UserPlus, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const users = mockDb.getUsers();
    setDoctors(users.filter(u => u.role === 'doctor'));
  }, []);

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    const users = mockDb.getUsers();
    
    // Check if username exists
    if (users.some(u => u.username === newUsername)) {
      alert('Username already exists');
      return;
    }

    const newDoctor: User = {
      id: `doc-${Date.now()}`,
      username: newUsername,
      passwordHash: newPassword,
      role: 'doctor',
      name: newName,
      mustChangePassword: true
    };

    const updatedUsers = [...users, newDoctor];
    mockDb.saveUsers(updatedUsers);
    setDoctors(updatedUsers.filter(u => u.role === 'doctor'));
    
    setSuccessMsg(`Doctor ${newName} added successfully.`);
    setNewUsername('');
    setNewName('');
    setNewPassword('');
    
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Doctor Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              Register Doctor
            </CardTitle>
            <CardDescription>Create a new account for an orthopedic surgeon.</CardDescription>
          </CardHeader>
          <form onSubmit={handleAddDoctor}>
            <CardContent className="space-y-4">
              {successMsg && (
                <div className="p-3 text-sm text-teal-700 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400 rounded-md">
                  {successMsg}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  required 
                  placeholder="Dr. John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                  required 
                  placeholder="johndoe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Password</label>
                <Input 
                  type="text" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  placeholder="Will be forced to change"
                />
              </div>
              <Button type="submit" className="w-full">Create Account</Button>
            </CardContent>
          </form>
        </Card>

        {/* Doctors List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Registered Surgeons
            </CardTitle>
            <CardDescription>Manage access to the clinical archive.</CardDescription>
          </CardHeader>
          <CardContent>
            {doctors.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No doctors registered yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-md">Name</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-tr-md">ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doc) => (
                      <tr key={doc.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <td className="px-4 py-3 font-medium">{doc.name}</td>
                        <td className="px-4 py-3 text-slate-500">{doc.username}</td>
                        <td className="px-4 py-3">
                          {doc.mustChangePassword ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              Pending Setup
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{doc.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
