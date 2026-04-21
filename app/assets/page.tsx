'use client';

import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload, File, Image as ImageIcon, FileText } from 'lucide-react';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function AssetsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assets & Files</h1>
            <p className="text-dark-gray/60">Centralized storage for artwork, mockups, and documents.</p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-dark-gray/50" />
              <Input placeholder="Search files..." className="pl-9" />
            </div>
            <Button className="bg-royal hover:bg-royal/90 text-white">
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
          </div>
        </div>

        <motion.div 
          className="grid gap-4 md:grid-cols-3 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Placeholder Assets */}
          {[
            { name: 'Logo_Final.ai', type: 'vector', size: '2.4 MB', date: 'Oct 12' },
            { name: 'Front_Mockup.png', type: 'image', size: '1.1 MB', date: 'Oct 12' },
            { name: 'Back_Mockup.png', type: 'image', size: '1.2 MB', date: 'Oct 12' },
            { name: 'PO_10492.pdf', type: 'doc', size: '450 KB', date: 'Oct 10' },
            { name: 'Packing_Slip.pdf', type: 'doc', size: '120 KB', date: 'Oct 09' },
            { name: 'Brand_Guidelines.pdf', type: 'doc', size: '5.6 MB', date: 'Sep 28' },
          ].map((file, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="cursor-pointer hover:border-royal/50 transition-colors shadow-sm hover:shadow-md h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-40">
                  {file.type === 'vector' && <File className="h-10 w-10 text-royal mb-3" />}
                  {file.type === 'image' && <ImageIcon className="h-10 w-10 text-green-500 mb-3" />}
                  {file.type === 'doc' && <FileText className="h-10 w-10 text-red-500 mb-3" />}
                  <div className="font-medium text-sm truncate w-full">{file.name}</div>
                  <div className="text-xs text-dark-gray/50 mt-1">{file.size} • {file.date}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
}
