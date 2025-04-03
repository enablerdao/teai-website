import {
  OrganizationsClient,
  CreateAccountCommand,
  CreateAccountCommandInput,
  DescribeCreateAccountStatusCommand,
  TagResourceCommand,
} from "@aws-sdk/client-organizations";

import {
  BudgetsClient,
  CreateBudgetCommand,
  CreateBudgetActionCommand,
} from "@aws-sdk/client-budgets";

import {
  IAMClient,
  CreateRoleCommand,
  PutRolePolicyCommand,
} from "@aws-sdk/client-iam";

export class AWSOrganizationManager {
  private organizationsClient: OrganizationsClient;
  private budgetsClient: BudgetsClient;
  private iamClient: IAMClient;

  constructor() {
    const config = {
      region: "ap-northeast-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    };

    this.organizationsClient = new OrganizationsClient(config);
    this.budgetsClient = new BudgetsClient(config);
    this.iamClient = new IAMClient(config);
  }

  async createNewAccount(email: string, accountName: string, userId: string): Promise<string> {
    // 1. Create new AWS account
    const createAccountInput: CreateAccountCommandInput = {
      Email: email,
      AccountName: accountName,
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
    };

    const createAccountResponse = await this.organizationsClient.send(
      new CreateAccountCommand(createAccountInput)
    );

    const createAccountStatusId = createAccountResponse.CreateAccountStatus?.Id;
    if (!createAccountStatusId) {
      throw new Error("Failed to create AWS account");
    }

    // 2. Wait for account creation to complete
    const accountId = await this.waitForAccountCreation(createAccountStatusId);

    // 3. Set up budget
    await this.setupBudget(accountId, 1000); // 1000円の予算を設定

    // 4. Set up IAM roles
    await this.setupIAMRoles(accountId);

    return accountId;
  }

  private async waitForAccountCreation(statusId: string): Promise<string> {
    let accountId: string | undefined;
    let attempts = 0;
    const maxAttempts = 60; // 5分間待機（5秒間隔）

    while (attempts < maxAttempts) {
      const statusResponse = await this.organizationsClient.send(
        new DescribeCreateAccountStatusCommand({
          CreateAccountRequestId: statusId,
        })
      );

      const status = statusResponse.CreateAccountStatus;
      if (status?.State === "SUCCEEDED") {
        accountId = status.AccountId;
        break;
      } else if (status?.State === "FAILED") {
        throw new Error(`Account creation failed: ${status.FailureReason}`);
      }

      await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒待機
      attempts++;
    }

    if (!accountId) {
      throw new Error("Account creation timed out");
    }

    return accountId;
  }

  private async setupBudget(accountId: string, amount: number) {
    // 予算の作成
    const budgetName = `teai-budget-${accountId}`;
    await this.budgetsClient.send(
      new CreateBudgetCommand({
        AccountId: accountId,
        Budget: {
          BudgetName: budgetName,
          BudgetLimit: {
            Amount: amount.toString(),
            Unit: "JPY",
          },
          TimeUnit: "MONTHLY",
          BudgetType: "COST",
        },
      })
    );

    // 予算アクションの設定（80%到達時にEC2インスタンスを停止）
    // TODO: Fix budget action setup
    /*
    await this.budgetsClient.send(
      new CreateBudgetActionCommand({
        AccountId: accountId,
        BudgetName: budgetName,
        NotificationType: "ACTUAL",
        ActionThreshold: {
          Value: 80,
        },
        ActionType: "STOP_EC2_INSTANCES",
        Definition: {
          IamActionDefinition: {
            PolicyArn: "arn:aws:iam::aws:policy/AWSBudgetsActionsWithAWSResourceControlAccess",
            Roles: ["TeAIBudgetRole"],
          },
        },
      })
    );
    */
  }

  private async setupIAMRoles(accountId: string) {
    // EC2インスタンス管理用のIAMロールを作成
    const roleName = "TeAIInstanceManager";
    await this.iamClient.send(
      new CreateRoleCommand({
        RoleName: roleName,
        AssumeRolePolicyDocument: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: "ec2.amazonaws.com",
              },
              Action: "sts:AssumeRole",
            },
          ],
        }),
      })
    );

    // ロールにポリシーをアタッチ（EC2の起動/停止権限）
    await this.iamClient.send(
      new PutRolePolicyCommand({
        RoleName: roleName,
        PolicyName: "TeAIInstancePolicy",
        PolicyDocument: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "ec2:StartInstances",
                "ec2:StopInstances",
                "ec2:DescribeInstances",
              ],
              Resource: "*",
              Condition: {
                StringEquals: {
                  "aws:ResourceTag/CreatedBy": "TeAI",
                },
              },
            },
          ],
        }),
      })
    );
  }
}
