import { NextResponse } from 'next/server';
const resources = [
  { id:1, name:'Computer Lab A', type:'lab', building:'Tech Block', floor:'2nd', capacity:40, amenities:['Projector','AC','Wi-Fi','Whiteboard'], status:'active' },
  { id:2, name:'Computer Lab B', type:'lab', building:'Tech Block', floor:'2nd', capacity:35, amenities:['Projector','AC','Wi-Fi'], status:'active' },
  { id:3, name:'Physics Lab', type:'lab', building:'Science Block', floor:'1st', capacity:30, amenities:['AC','Instruments'], status:'active' },
  { id:4, name:'Chemistry Lab', type:'lab', building:'Science Block', floor:'1st', capacity:25, amenities:['AC','Fume Hood'], status:'active' },
  { id:5, name:'Electronics Lab', type:'lab', building:'Tech Block', floor:'3rd', capacity:30, amenities:['Oscilloscopes','AC'], status:'active' },
  { id:11, name:'Main Auditorium', type:'hall', building:'Central Block', floor:'Ground', capacity:500, amenities:['Projector','Sound System','Stage'], status:'active' },
  { id:12, name:'Mini Auditorium', type:'hall', building:'Central Block', floor:'1st', capacity:150, amenities:['Projector','Sound System'], status:'active' },
  { id:13, name:'Conference Hall', type:'hall', building:'Admin Block', floor:'3rd', capacity:80, amenities:['Video Conf','Whiteboard'], status:'active' },
];
export async function GET() { return NextResponse.json({ resources }); }
