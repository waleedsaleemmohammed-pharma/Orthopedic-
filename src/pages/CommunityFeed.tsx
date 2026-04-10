import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDb, SurgicalCase } from '../store/mockDb';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Globe, MessageSquare, ThumbsUp, Share2, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function CommunityFeed() {
  const [sharedCases, setSharedCases] = useState<SurgicalCase[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const allCases = mockDb.getCases();
    setSharedCases(allCases.filter(c => c.isSharedToCommunity).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="text-center space-y-2 mb-8">
        <div className="mx-auto w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-500 rounded-full flex items-center justify-center mb-4">
          <Globe className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">The Atlas</h1>
        <p className="text-slate-500 dark:text-slate-400">Clinical Social Network & Educational Archive</p>
      </div>

      {sharedCases.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent>
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100">No cases shared yet</p>
            <p className="text-sm text-slate-500 mt-1">Be the first to share an interesting case with the community.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sharedCases.map(c => (
            <Card 
              key={c.id} 
              className="overflow-hidden cursor-pointer hover:border-teal-500/50 transition-colors"
              onClick={() => navigate(`/case/${c.id}`)}
            >
              <CardHeader className="pb-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-teal-700 dark:text-teal-400">{c.diagnosis}</CardTitle>
                    <CardDescription className="mt-1">
                      Shared on {format(new Date(c.createdAt), 'MMMM dd, yyyy')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                
                {/* Images Preview */}
                {c.imageUrls && c.imageUrls.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {c.imageUrls.slice(0, 3).map((url, idx) => (
                      <div key={idx} className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
                        {url.endsWith('.pdf') ? (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                            <FileText className="w-6 h-6 mb-1 text-slate-400" />
                            <span className="text-[10px] font-medium">PDF</span>
                          </div>
                        ) : (
                          <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                    {c.imageUrls.length > 3 && (
                      <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-700 font-medium">
                        +{c.imageUrls.length - 3} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-32 bg-slate-50 dark:bg-slate-900 rounded-md flex items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-800">
                    <div className="text-center">
                      <p className="font-mono text-xs tracking-widest uppercase opacity-50">No Media</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div>
                    <span className="text-slate-500 block mb-1">Approach</span>
                    <span className="font-medium">{c.surgicalApproach || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Implants</span>
                    <span className="font-medium line-clamp-2">{c.implantsUsed || 'N/A'}</span>
                  </div>
                </div>
                
                {c.surgicalPlan && (
                  <div className="text-sm">
                    <span className="text-slate-500 block mb-1">Surgical Plan</span>
                    <p className="text-slate-700 dark:text-slate-300 line-clamp-3">{c.surgicalPlan}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 pb-4 flex gap-4" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
                  <ThumbsUp className="w-4 h-4" />
                  Like
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
                  <MessageSquare className="w-4 h-4" />
                  Discuss
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-slate-500 ml-auto">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
