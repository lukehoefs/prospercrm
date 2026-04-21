'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const STAGES = ["Inventory Received", "Ready to Pick", "Packing", "Shipped", "Completed"];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

export default function FulfillmentPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const qJobs = query(collection(db, 'fulfillmentJobs'), orderBy('createdAt', 'desc'));
    const unsubJobs = onSnapshot(qJobs, (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qOrders = query(collection(db, 'orders'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qCustomers = query(collection(db, 'customers'));
    const unsubCustomers = onSnapshot(qCustomers, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubJobs();
      unsubOrders();
      unsubCustomers();
    };
  }, []);

  const getOrderDetails = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    const customer = customers.find(c => c.id === order.customerId);
    return { ...order, customerName: customer?.companyName || 'Unknown' };
  };

  const moveJob = async (jobId: string, newStage: string) => {
    try {
      const jobRef = doc(db, 'fulfillmentJobs', jobId);
      await updateDoc(jobRef, { stage: newStage });
    } catch (error) {
      console.error("Error updating job stage: ", error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      await moveJob(draggableId, destination.droppableId);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 h-full flex flex-col">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fulfillment Queue</h1>
          <p className="text-dark-gray/60">Manage pick, pack, and ship operations.</p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start">
            {STAGES.map(stage => {
              const stageJobs = jobs.filter(j => j.stage === stage);
              return (
                <div key={stage} className="flex-shrink-0 w-80 bg-dark-gray/5 rounded-lg p-4 flex flex-col gap-3 min-h-[500px]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-dark-gray/70">{stage}</h3>
                    <Badge variant="secondary" className="font-mono">{stageJobs.length}</Badge>
                  </div>
                  
                  <Droppable droppableId={stage}>
                    {(provided) => (
                      <div 
                        className="flex flex-col gap-3 min-h-[150px]"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {stageJobs.map((job, index) => {
                          const order = getOrderDetails(job.orderId);
                          if (!order) return null;

                          return (
                            <Draggable key={job.id} draggableId={job.id} index={index}>
                              {(provided, snapshot) => (
                                <Card 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`cursor-pointer hover:border-royal/50 transition-colors border-l-4 border-l-royal shadow-sm hover:shadow-md ${snapshot.isDragging ? 'shadow-lg ring-2 ring-royal/50' : ''}`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="font-bold text-lg">{order.orderName}</div>
                                      <Badge variant="outline" className="font-mono bg-white">{order.quantity} units</Badge>
                                    </div>
                                    <div className="text-sm font-semibold text-dark-gray/80 mb-3">{order.customerName}</div>
                                    
                                    <div className="flex items-center justify-between mt-4">
                                      <div className="text-xs font-semibold text-dark-gray/50 uppercase tracking-wider">
                                        Due: {order.dueDate ? format(new Date(order.dueDate), 'MMM d') : 'N/A'}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {stageJobs.length === 0 && (
                          <div className="text-center py-8 text-sm text-dark-gray/40 border-2 border-dashed border-dark-gray/10 rounded-lg">
                            Drop jobs here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </AppLayout>
  );
}
