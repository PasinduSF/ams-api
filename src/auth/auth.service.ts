/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import Web3 from 'web3';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  private readonly web3: Web3;
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    this.web3 = new Web3();
  }

  // Function to generate nonce and temporary token
  getNonceAndTempToken(address: string) {
    // Generate nonce using timestamp
    const nonce = new Date().getTime();

    // Access JWT secret from the .env file
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    const tempToken = jwt.sign({ nonce, address }, jwtSecret, {
      expiresIn: '1d',
    });
    const message = this.getSignMessage(address, nonce);
    return { tempToken, message };
  }

  // Get Sign Message function
  getSignMessage(address: string, nonce: number): string {
    return `Sign this message with nonce: ${nonce} for address: ${address}`;
  }

  // Verify the token, validate the signature, and generate a new token
  async verifyAdminToken(signature: string, authHeader: string) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const tempToken = authHeader.split(' ')[1];
    if (!tempToken) {
      throw new Error('Token is missing');
    }

    try {
      // Verify the token
      const userData = jwt.verify(tempToken, jwtSecret) as any;
      const nonce = userData.nonce;
      const address = userData.address;
      const message = this.getSignMessage(address, nonce);

      // Recover the address from the signature
      const verifiedAddress = await this.web3.eth.accounts.recover(
        message,
        signature,
      );

      // Check if the recovered address matches the address in the token
      if (verifiedAddress.toLowerCase() !== address.toLowerCase()) {
        throw new ConflictException('Address does not match the signature');
      }

      // Check if the address exists in the Admin database first
      const adminAddress = await this.userService.findAdminAddress({
        walletAddress: verifiedAddress,
      });

      if (adminAddress) {
        // If admin exists, get their organization ID
        const adminData =
          await this.userService.getAdminDetails(verifiedAddress);

        // Generate admin token with organization ID and session
        const payload: jwt.JwtPayload = {
          address: verifiedAddress,
          organizationId: adminData.id,
          role: 'admin',
          adminId: adminData.adminId,
        };

        const token = jwt.sign(payload, jwtSecret, {
          expiresIn: '1d',
        });

        return {
          token,
          role: 'admin',
          organizationId: adminData.id,
          adminId: adminData.adminId,
          adminWallet: adminData.walletAddress,
        };
      }
      throw new ConflictException('Address not found in the database');
    } catch (error) {
      console.error(error);
      throw new ConflictException('Faild to connect wallet');
    }
  }

  // Verify the token, validate the signature, and generate a new token
  async verifyEmployeeToken(signature: string, authHeader: string) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const tempToken = authHeader.split(' ')[1];
    if (!tempToken) {
      throw new Error('Token is missing');
    }

    try {
      // Verify the token
      const userData = jwt.verify(tempToken, jwtSecret) as any;
      const nonce = userData.nonce;
      const address = userData.address;
      const message = this.getSignMessage(address, nonce);

      // Recover the address from the signature
      const verifiedAddress = await this.web3.eth.accounts.recover(
        message,
        signature,
      );

      // Check if the recovered address matches the address in the token
      if (verifiedAddress.toLowerCase() !== address.toLowerCase()) {
        throw new ConflictException('Address does not match the signature');
      }

      // Check if the address exists in the Admin database first
      const empAddress = await this.userService.findEmpAddress({
        walletAddress: verifiedAddress,
      });
      if (empAddress) {
        const empData = await this.userService.getEmpDetails(verifiedAddress);

        // Generate empl token with session
        const payload: jwt.JwtPayload = {
          address: verifiedAddress,
          role: 'employee',
        };

        const token = jwt.sign(payload, jwtSecret, {
          expiresIn: '1d',
        });

        return {
          token,
          role: 'employee',
          empId: empData.empId,
        };
      }

      throw new ConflictException('Address not found in the database');
    } catch (error) {
      console.error(error);
      throw new ConflictException('Faild to connect wallet');
    }
  }

  async verifyPOToken(signature: string, authHeader: string) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const tempToken = authHeader.split(' ')[1];
    if (!tempToken) {
      throw new Error('Token is missing');
    }

    try {
      // Verify the token
      const userData = jwt.verify(tempToken, jwtSecret) as any;
      const nonce = userData.nonce;
      const address = userData.address;
      const message = this.getSignMessage(address, nonce);

      // Recover the address from the signature
      const verifiedAddress = await this.web3.eth.accounts.recover(
        message,
        signature,
      );
      // Check if the recovered address matches the address in the token
      if (verifiedAddress.toLowerCase() !== address.toLowerCase()) {
        throw new ConflictException('Address does not match the signature');
      }

      try {
        // Check for PO
        await this.userService.findPOAddress({
          walletAddress: verifiedAddress,
        });

        // Generate PO token with session
        const payload: jwt.JwtPayload = {
          address: verifiedAddress,
          role: 'po',
        };

        const token = jwt.sign(payload, jwtSecret, {
          expiresIn: '1d',
        });

        return {
          token,
          role: 'Product Owner',
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new ConflictException('PO Address not found in the database');
        }
        throw error;
      }
    } catch (error) {
      throw new ConflictException('Faild to connect wallet');
    }
  }
}
