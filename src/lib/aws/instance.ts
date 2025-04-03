import {
  EC2Client,
  RunInstancesCommand,
  StopInstancesCommand,
  StartInstancesCommand,
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";

export class AWSInstanceManager {
  private ec2Client: EC2Client;

  constructor(accountId: string, region: string = "ap-northeast-1") {
    this.ec2Client = new EC2Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async createInstance(
    instanceType: "t2.micro" | "t2.small" | "t2.medium",
    userId: string,
    imageId: string = "ami-0d52744d6551d851e" // Amazon Linux 2023
  ): Promise<string> {
    const response = await this.ec2Client.send(
      new RunInstancesCommand({
        ImageId: imageId,
        InstanceType: instanceType,
        MinCount: 1,
        MaxCount: 1,
        TagSpecifications: [
          {
            ResourceType: "instance",
            Tags: [
              {
                Key: "CreatedBy",
                Value: "TeAI",
              },
              {
                Key: "UserId",
                Value: userId,
              },
            ],
          },
        ],
        IamInstanceProfile: {
          Name: "TeAIInstanceManager",
        },
      })
    );

    const instanceId = response.Instances?.[0]?.InstanceId;
    if (!instanceId) {
      throw new Error("Failed to create instance");
    }

    return instanceId;
  }

  async stopInstance(instanceId: string): Promise<void> {
    await this.ec2Client.send(
      new StopInstancesCommand({
        InstanceIds: [instanceId],
      })
    );
  }

  async startInstance(instanceId: string): Promise<void> {
    await this.ec2Client.send(
      new StartInstancesCommand({
        InstanceIds: [instanceId],
      })
    );
  }

  async getInstanceStatus(instanceId: string): Promise<string> {
    const response = await this.ec2Client.send(
      new DescribeInstancesCommand({
        InstanceIds: [instanceId],
      })
    );

    return response.Reservations?.[0]?.Instances?.[0]?.State?.Name || "unknown";
  }
}
