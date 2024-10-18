import {
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service'; // Import your AuthService

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/nonce')
  getNonceAndTempToken(@Query('address') address: string) {
    // Validate the address parameter
    if (!address) {
      return { error: 'Address is required' };
    }
    // Call the AuthService to generate the nonce and temp token
    const { tempToken, message } =
      this.authService.getNonceAndTempToken(address);

    // Return the generated token and message
    return {
      tempToken,
      message,
    };
  }

  @Post('/verifyAdmin')
  async verifyAdminToken(
    @Body('signature') signature: string,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      return this.authService.verifyAdminToken(signature, authHeader);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new ConflictException(error.message);
    }
  }

  @Post('/verifyPo')
  async verifyPoToken(
    @Body('signature') signature: string,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      return this.authService.verifyPOToken(signature, authHeader);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new ConflictException(error.message);
    }
  }

  @Post('/verifyEmployee')
  async verifyEmpToken(
    @Body('signature') signature: string,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      return this.authService.verifyEmployeeToken(signature, authHeader);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new ConflictException(error.message);
    }
  }
}
