import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/user.model';

@Injectable()
export class OverviewService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getDashboardStats() {
    const totalUsers = await this.userModel.countDocuments();
    const activeToday = await this.userModel.countDocuments({
      lastActive: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });
    const restrictedUsers = await this.userModel.countDocuments({
      status: false,
    });

    const recentSignups = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('-password');

    const monthlyActivity = await this.userModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$lastActive',
                    new Date(new Date().setHours(0, 0, 0, 0)),
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return {
      stats: [
        {
          title: 'Total Users',
          value: totalUsers.toString(),
          change: '+12.3%',
          description: 'Total registered users',
        },
        {
          title: 'Active Today',
          value: activeToday.toString(),
          change: '+4.6%',
          description: 'Users active in the last 24h',
        },
        {
          title: 'Messages Sent',
          value: '12.5K',
          change: '+23.1%',
          description: 'Total messages this month',
        },
        {
          title: 'Restricted Users',
          value: restrictedUsers.toString(),
          change: '-2',
          description: 'Currently restricted accounts',
        },
      ],
      recentSignups,

      userActivity: monthlyActivity.map((data) => ({
        month: `${data?._id.year}-${data._id.month?.toString().padStart(2, '0')}`, // Format: YYYY-MM
        totalUsers: data?.totalUsers,
        activeUsers: data?.activeUsers,
      })),
    };
  }
}
