import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SelfOrAdminGuard } from '../../common/guards/self-or-admin.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllIncludingDeleted() {
    return this.usersService.findAllIncludingDeleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, SelfOrAdminGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async softDelete(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user.sub || req.user.userId;

    // Protection: Admin ne peut pas se supprimer lui-même
    if (id === adminId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte');
    }

    // Vérifier que l'utilisateur cible n'est pas admin
    const targetUser = await this.usersService.findOne(id);
    if (targetUser && targetUser.role === 'admin') {
      throw new ForbiddenException('Impossible de supprimer un autre administrateur');
    }

    return this.usersService.softDelete(id, adminId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, AdminGuard)
  restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }

  @Delete('bulk/delete')
  @UseGuards(JwtAuthGuard, AdminGuard)
  bulkDelete(@Body() body: { ids: string[] }, @Request() req: any) {
    const adminId = req.user.sub || req.user.userId;
    return this.usersService.bulkSoftDelete(body.ids, adminId);
  }
}
