import { useState, useEffect } from 'react';
import { mockDb, SurgicalCase } from '../store/mockDb';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PlusCircle, Search, Activity, Globe } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { format } from 'date-fns';

export default function DoctorDashboard() {
  const [cases, setCases] = useState<SurgicalCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCases(mockDb.getCases());
  }, []);

  const filteredCases = cases.filter(c => 
    c.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.surgicalApproach.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Archive</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your surgical cases and clinical records.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/community">
            <Button variant="outline" className="gap-2">
              <Globe className="w-4 h-4" />
              The Atlas
            </Button>
          </Link>
          <Link to="/log-surgery">
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" />
              New Case
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by diagnosis, approach..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
            <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100">No cases found</p>
            <p className="text-sm mt-1">Start by logging your first surgical case.</p>
            <Link to="/log-surgery" className="mt-4 inline-block">
              <Button variant="outline">Log Surgery</Button>
            </Link>
          </div>
        ) : (
          filteredCases.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-teal-600">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1" title={c.diagnosis}>{c.diagnosis}</CardTitle>
                  {c.isSharedToCommunity && (
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                      Shared
                    </span>
                  )}
                </div>
                <CardDescription>{format(new Date(c.date), 'MMM dd, yyyy')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Approach:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{c.surgicalApproach}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Anesthesia:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{c.anesthesiaType}</span>
                  </div>
                  {c.traumaClassification && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Class:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{c.traumaClassification}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
